import { ExternalLogSeverity } from '../typings/externalLogMetadata'
import type { ApplicationSettingsParserParams } from '../utils/applicationSettingsParser'
import applicationSettingsParser from '../utils/applicationSettingsParser'

async function setApplicationSettings(
  ctx: Context,
  next: () => Promise<void>
): Promise<void> {
  const {
    state: { logs },
    vtex: { settings },
  } = ctx

  try {
    logs.push({
      message: 'Settings received',
      middleware: 'Set Application Settings',
      severity: ExternalLogSeverity.INFO,
      payload: {
        details: (settings as ApplicationSettingsParserParams)?.map(
          (setting) => setting.declarer
        ),
      },
    })

    ctx.state.appSettings = applicationSettingsParser(settings)

    await next()
  } catch (e) {
    logs.push({
      message: 'Error while getting the application setttings',
      middleware: 'Middlewares/Set Application Settings',
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: e.message,
        stack: e.stack,
      },
    })
  }
}

export default setApplicationSettings
