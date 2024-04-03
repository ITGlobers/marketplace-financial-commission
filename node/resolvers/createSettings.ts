import { config } from '../constants'
import { ExternalLogSeverity } from '../typings/externalLogMetadata'

export const createSettings = async (
  _: unknown,
  {
    settingsData,
  }: {
    settingsData: any
  },
  ctx: Context
): Promise<string> => {
  const {
    clients: { vbase },
    state: { logs },
    vtex: { account: marketplace },
  } = ctx

  const { sellerName } = settingsData
  const idBucket = sellerName || marketplace

  try {
    await vbase.saveJSON<any>(config.SETTINGS_BUCKET, idBucket, settingsData)
  } catch (err) {
    logs.push({
      message: 'Error while storing the settings',
      middleware: 'Resolvers/Create Settings',
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: err.message,
        stack: err.stack,
        idBucket,
        settingsData,
      },
    })
  }

  return settingsData
}
