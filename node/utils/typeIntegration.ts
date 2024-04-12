import type { Clients } from '../clients'
import { config } from '../constants'

export const typeIntegration = async (ctx: Context): Promise<any> => {
  const {
    clients: { vbase },
    vtex: { account: marketplace },
  } = ctx

  const idBucket = marketplace

  const response = await vbase.getJSON<MarketplaceSettings>(
    config.SETTINGS_BUCKET,
    idBucket
  )

  return response.integration
}

export const typeIntegrationWithoutContext = async (
  clients: Clients
): Promise<any> => {
  const { vbase } = clients

  const idBucket = process.env.account || 'obidev'

  const response = await vbase.getJSON<MarketplaceSettings>(
    config.SETTINGS_BUCKET,
    idBucket
  )

  return response.integration
}
