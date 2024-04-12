import { errorHandler } from '../middlewares'
import setApplicationSettings from '../middlewares/setApplicationSettings'
import { ExternalLogSeverity } from '../typings/externalLogMetadata'
import { createTemplate } from '../utils/createTemplate'

const MW_NAME = 'Initial Configuration'

async function runEvent(ctx: AppEventContext) {
  const {
    clients: { scheduler },
    state: { logs },
  } = ctx

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

  const appName = `${process.env.VTEX_APP_NAME}`

  try {
    await scheduler.createScheduler(appName, schedulerPingRequest)

    logs.push({
      message: 'create-scheduler-financial-commission-ping',
      middleware: MW_NAME,
      severity: ExternalLogSeverity.INFO,
    })
  } catch (error) {
    logs.push({
      message: 'error-create-scheduler-financial-commission-ping',
      middleware: MW_NAME,
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: error.message,
        stack: error?.stack,
      },
    })
  }

  try {
    await createTemplate(ctx.clients)

    logs.push({
      message: 'create-template-commission',
      middleware: MW_NAME,
      severity: ExternalLogSeverity.INFO,
    })
  } catch (error) {
    logs.push({
      message: 'error-create-template-commission',
      middleware: MW_NAME,
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: error.message,
        stack: error?.stack,
      },
    })
  }

  return true
}

export async function onAppsInstalled(ctx: AppEventContext) {
  const mwContext = ctx as unknown as Context
  const nextHandler = () => Promise.resolve()

  await errorHandler(mwContext, async () => {
    await setApplicationSettings(mwContext, nextHandler)
    await runEvent(ctx)
  })
}
