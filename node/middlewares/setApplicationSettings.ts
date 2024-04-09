import applicationSettingsParser from '../utils/applicationSettingsParser'

async function setApplicationSettings(
  ctx: Context,
  next: () => Promise<void>
): Promise<void> {
  const {
    vtex: { logger },
  } = ctx

  try {
    ctx.state.appSettings = applicationSettingsParser(ctx.vtex.settings)

    await next()
  } catch (e) {
    logger.error({
      message: 'Error while getting the application setttings',
      middleware: 'Middlewares/Set Application Settings',
      payload: {
        details: e.message,
        stack: e.stack,
      },
    })
  }
}

export default setApplicationSettings
