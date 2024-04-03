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
export async function authentication(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { vbase },
    request: { header },
    state: {
      body: { seller },
    },
  } = ctx

  const accountMarketplace = ctx.vtex.account

  const { name, account } = seller as Seller

  const keyBucket = `${accountMarketplace}-${name}-${account}`

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

  ctx.query.sellerName = name

  await next()
}
