import { config } from '../constants'
import { ExternalLogSeverity } from '../typings/externalLogMetadata'
import { createKeyToken } from '../utils'

export const createTokenMarketplaceService = async (
  accountMarketplace: string,
  ctx: Context
) => {
  const {
    clients: { vbase },
    state: { logs },
  } = ctx

  const date = new Date()
  const creationDate = date.toISOString()

  const autheticationToken = createKeyToken()

  const keyBucket = `${accountMarketplace}`

  let vbaseData: TokenConfiguration | undefined
  let lastModificationDate

  try {
    vbaseData = await vbase.getJSON<TokenConfiguration>(
      config.BUCKET_VBASE_TOKEN,
      keyBucket
    )
  } catch (err) {
    logs.push({
      message: 'Error while getting the account token',
      middleware: 'Services/CreateTokenMarketplaceService',
      severity: ExternalLogSeverity.ERROR,
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
    account: accountMarketplace,
    autheticationToken,
    creationDate: vbaseData?.creationDate as string,
    enabled: true,
    name: accountMarketplace,
    id: accountMarketplace,
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
      accountId: accountMarketplace,
      autheticationToken,
      creationDate,
      resultVBase,
    },
  }
}
