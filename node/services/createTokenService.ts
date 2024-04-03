import { config } from '../constants'
import { ExternalLogSeverity } from '../typings/externalLogMetadata'
import { createKeyToken } from '../utils'

export const createTokenService = async (seller: Seller, ctx: Context) => {
  const {
    clients: { vbase },
    state: { logs },
  } = ctx

  const date = new Date()
  const creationDate = date.toISOString()

  const accountMarketplace = ctx.vtex.account

  const { id, name, account } = seller as Seller
  const sellerId = id as string

  const autheticationToken = createKeyToken()

  const keyBucket = `${accountMarketplace}-${name}-${account}`

  let vbaseData: TokenConfiguration | undefined
  let lastModificationDate

  try {
    vbaseData = await vbase.getJSON<TokenConfiguration>(
      config.BUCKET_VBASE_TOKEN,
      keyBucket
    )
  } catch (err) {
    logs.push({
      message: 'Error while sending the email',
      middleware: 'Services/CreateTokenService',
      severity: ExternalLogSeverity.INFO,
      payload: {
        details: err.message,
        stack: err.stack,
      },
    })
  }

  if (vbaseData) {
    lastModificationDate = creationDate
  }

  const vbaseBody: TokenConfiguration = {
    account,
    autheticationToken,
    creationDate: vbaseData?.creationDate as string,
    enabled: true,
    name,
    id,
    lastModificationDate,
  }

  const resultVBase = await vbase.saveJSON(
    config.BUCKET_VBASE_TOKEN,
    keyBucket,
    vbaseBody
  )

  return {
    status: 200,
    resultCreateToken: {
      message: 'Successful token creation',
      accountId: sellerId,
      autheticationToken,
      creationDate,
      resultVBase,
    },
  }
}
