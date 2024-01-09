import { SCHEMAS } from '../constants'

export async function setSchemaVersion(
  ctx: Context,
  next: () => Promise<any>
): Promise<any> {
  const {
    vtex: { production, workspace },
  } = ctx

  ctx.clients.externalInvoices.schema = production
    ? SCHEMAS.DEFAULT
    : `${SCHEMAS.DEFAULT}-${workspace}`
  ctx.clients.payoutReports.schema = production
    ? SCHEMAS.DEFAULT
    : `${SCHEMAS.DEFAULT}-${workspace}`
  ctx.clients.commissionInvoices.schema = production
    ? SCHEMAS.DEFAULT
    : `${SCHEMAS.DEFAULT}-${workspace}`
  ctx.clients.sellersDashboardClientMD.schema = production
    ? SCHEMAS.DEFAULT
    : `${SCHEMAS.DEFAULT}-${workspace}`
  ctx.clients.statisticsDashboardClientMD.schema = production
    ? SCHEMAS.DEFAULT
    : `${SCHEMAS.DEFAULT}-${workspace}`

  await next()
}
