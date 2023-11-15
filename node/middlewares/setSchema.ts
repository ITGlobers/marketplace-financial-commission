import { SCHEMAS } from '../constants'

export async function setSchemaVersion(
  ctx: Context,
  next: () => Promise<any>
): Promise<any> {
  ctx.clients.externalInvoices.schema = SCHEMAS.DEFAULT
  ctx.clients.payoutReports.schema = SCHEMAS.DEFAULT
  ctx.clients.commissionInvoices.schema = SCHEMAS.DEFAULT
  ctx.clients.sellersDashboardClientMD.schema = SCHEMAS.DEFAULT
  ctx.clients.statisticsDashboardClientMD.schema = SCHEMAS.DEFAULT

  await next()
}
