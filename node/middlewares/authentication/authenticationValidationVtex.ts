import type { ErrorLike } from '@vtex/api'
import { AuthenticationError, UserInputError } from '@vtex/api'

import { ExternalLogSeverity } from '../../typings/externalLogMetadata'

export async function authenticationValidationVtex(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    clients: { appTokenClient },
    request: { header },
    state: { logs },
    vtex: {
      route: { params },
    },
  } = ctx

  const appkey = header['x-vtex-api-appkey'] as string | undefined
  const apptoken = header['x-vtex-api-apptoken'] as string | undefined
  const authCookie = header.vtexidclientautcookie as string | undefined

  try {
    if (authCookie) {
      const authenticatedUser = await appTokenClient.getAuthenticatedUser(
        authCookie
      )

      if (authenticatedUser === null) {
        throw new AuthenticationError('Unauthorized')
      }
    } else {
      if (!appkey) {
        const error: ErrorLike = {
          message: 'Header "X-VTEX-API-AppKey" is required.',
          name: 'X-VTEX-API-AppKey',
          stack: '',
        }

        throw new UserInputError(error)
      }

      if (!apptoken) {
        const error: ErrorLike = {
          message: 'Header "X-VTEX-API-AppToken" is required.',
          name: 'X-VTEX-API-AppToken',
          stack: '',
        }

        throw new UserInputError(error)
      }

      const resultToken = await appTokenClient.validateAppKeyAndToken({
        appkey,
        apptoken,
      })

      const { authStatus } = resultToken

      if (authStatus !== 'Success') {
        throw new AuthenticationError('Unauthorized')
      }
    }

    ctx.request.header = header
    ctx.vtex.route.params = params

    ctx.set('Cache-Control', 'no-cache ')

    await next()
  } catch (error) {
    logs.push({
      message: 'Error while validating credentials',
      middleware: 'Authentication Validation VTEX',
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: error.message,
        stack: error?.stack,
        appkey,
      },
    })

    throw error
  }
}
