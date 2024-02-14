import type { EventContext } from '@vtex/api'

import type { Clients } from '../clients'

export async function onAppsInstalled (ctx: EventContext<Clients>)  {
  const {
    clients: { scheduler },
    vtex: { logger },
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
    logger.info({
      message: 'create-scheduler-financial-commission-ping',
    })
  } catch (error) {
    logger.error({
      message: 'error-create-scheduler-financial-commission-ping',
      error,
    })
  }

  return true
}


