import { AuthenticationError } from '@vtex/api'

import { config } from '../../constants'
import verifyToken from '../../utils/verifyToken'

/**
 * @description
 * Performs a custom authentication. Uses the seller to retrieve
 * their token. Can be skipped by being called through the seller app.
 * Writes a new query.
 * @query {sellerName}
 * Name of the seller; different from the id
 */
export async function authenticationMarketplace(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    clients: { vbase },
    request: { header },
  } = ctx

  const accountMarketplace = ctx.vtex.account

  const keyBucket = `${accountMarketplace}`

  let autheticationToken = ''
  let enabledToken = true

  try {
    const resultVBase = await vbase.getJSON<TokenConfiguration>(
      config.BUCKET_VBASE_TOKEN,
      keyBucket
    )

    autheticationToken = resultVBase.autheticationToken
    enabledToken = resultVBase.enabled
  } catch (err) {
    throw new AuthenticationError('Unauthorized')
  }

  await verifyToken({
    authToken: autheticationToken,
    enabledToken,
    headers: header,
  })

  await next()
}
