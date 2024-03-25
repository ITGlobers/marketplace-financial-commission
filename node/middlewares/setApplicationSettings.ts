import { ExternalLogSeverity } from '../typings/externalLogMetadata'
import applicationSettingsParser from '../utils/applicationSettingsParser'

async function setApplicationSettings(
  ctx: Context,
  next: () => Promise<void>
): Promise<void> {
  try {
    ctx.state.appSettings = applicationSettingsParser({
      settings: ctx.vtex.settings,
      userAgent: ctx.vtex.userAgent,
    })

    await next()
  } catch (e) {
    ctx.state.logs.push({
      severity: ExternalLogSeverity.ERROR,
      message: 'Error while getting the application setttings',
      middleware: 'Set Application Settings',
      payload: {
        details: e.message,
        stack: e.stack,
      },
    })
  }
}

export default setApplicationSettings
