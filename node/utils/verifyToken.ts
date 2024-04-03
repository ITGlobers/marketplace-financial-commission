import type { IncomingHttpHeaders } from 'http'

import { AuthenticationError } from '@vtex/api'

type VerifyTokenParams = {
  headers: IncomingHttpHeaders
  authToken: string
  enabledToken: boolean
}

const verifyToken = async ({
  authToken,
  enabledToken,
  headers,
}: VerifyTokenParams): Promise<void> => {
  const bearerHeader = headers.authorization

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ')

    if (authToken !== bearer[1]) {
      throw new AuthenticationError('Unauthorized')
    }

    if (!enabledToken) {
      throw new AuthenticationError('Unauthorized')
    }
  } else {
    throw new AuthenticationError('Unauthorized')
  }
}

export default verifyToken
