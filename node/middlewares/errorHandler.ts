import type { ExternalLogMetadata } from '../typings/externalLogMetadata'
import { ExternalLogSeverity } from '../typings/externalLogMetadata'
import { severityMapper } from '../utils/severityMapper'

/**
 * By awaiting the next middleware, we can use this scope to
 * centralize emitted errors down the promise chain.
 */
export async function errorHandler(ctx: Context, next: () => Promise<void>) {
  const {
    vtex: { logger },
    state,
  } = ctx

  if (!state.logs) state.logs = []

  try {
    await next()
  } catch (err) {
    state.logs.push({
      message: 'Error on execution',
      middleware: 'Middlewares/Error Handler',
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: err.message,
        stack: err.stack,
      },
    })
  }

  if (ctx.state.logs.length === 0) return

  const {
    state: { appSettings },
  } = ctx

  const mappedLogs = ctx.state.logs.map((log) => {
    // log into VTEX logging system
    logger.log(JSON.stringify(log, null, 2), severityMapper(log.severity))

    // map the log for the external log system
    const message: ExternalLogMetadata = {
      severity: log.severity,
      account: ctx.vtex.account,
      workspace: ctx.vtex.workspace,
      text: log.message,
      middleware: log.middleware,
      additionalInfo: log.payload,
    }

    return message
  })

  if (appSettings) {
    await ctx.clients.events.sendEvent(
      appSettings.loggerSettings.resourceId,
      appSettings.loggerSettings.eventName,
      mappedLogs
    )
  }
}
