import { ExternalLogSeverity } from '../typings/externalLogMetadata'

export const onAppsInstalled = async (ctx: AppEventContext) => {
  const {
    clients: { scheduler },
    body: { to, from },
    state: { logs },
  } = ctx

  if (to) {
    const [appName] = to?.id?.split('@')

    if (
      appName.length &&
      `${process.env.VTEX_APP_VENDOR}.${process.env.VTEX_APP_NAME}` === appName
    ) {
      const schedulerPingRequest: SchedulerRequest = {
        id: 'TO_BE_REPLACED',
        request: {
          uri: '',
          method: 'POST',
          headers: {},
        },
        scheduler: {
          expression: '1 0 * * *',
          endDate: '2029-12-30T23:29:00',
        },
      }

      schedulerPingRequest.id = 'dashboard-ping'
      schedulerPingRequest.request.uri = `https://${ctx.vtex.workspace}--${ctx.vtex.account}.myvtex.com/_v/financial-commission/ping`
      schedulerPingRequest.request.method = 'POST'
      schedulerPingRequest.request.headers = {
        'cache-control': 'no-store',
        pragma: 'no-store',
      }
      schedulerPingRequest.scheduler.expression = '*/1 * * * *'
      schedulerPingRequest.scheduler.endDate = '2100-01-01T23:30:00'

      try {
        await scheduler.createScheduler(appName, schedulerPingRequest)
        logs.push({
          severity: ExternalLogSeverity.INFO,
          middleware: 'Middlewares/Initial Configuration',
          message: 'create-scheduler-financial-commission-ping',
        })
      } catch (error) {
        logs.push({
          severity: ExternalLogSeverity.ERROR,
          middleware: 'Middlewares/Initial Configuration',
          message: 'error-create-scheduler-financial-commission-ping',
          payload: {
            details: error.message,
            stack: error.stack,
          },
        })
      }

      return true
    }
  } else if (from) {
    const [appName] = from?.id?.split('@')

    if (
      appName.length &&
      `${process.env.VTEX_APP_VENDOR}.${process.env.VTEX_APP_NAME}` === appName
    ) {
      const idName = 'dashboard-ping'

      try {
        await scheduler.deleteScheduler(appName, idName)

        logs.push({
          severity: ExternalLogSeverity.INFO,
          middleware: 'Middlewares/Initial Configuration',
          message: 'delete-scheduler-financial-commission-ping',
        })
      } catch (error) {
        logs.push({
          severity: ExternalLogSeverity.ERROR,
          middleware: 'Middlewares/Initial Configuration',
          message: 'error-delete-scheduler-financial-commission-ping',
          payload: {
            details: error.message,
            stack: error.stack,
          },
        })
      }

      return true
    }
  }

  return null
}
