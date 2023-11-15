import { SCHEMAS } from '../constants'

interface ContextFunction<T> {
  (_: any, params: any, ctx: Context): Promise<T>
}

export const wrapperFunction = <T>(originalFunction: ContextFunction<T>) => {
  return async (_: any, params: any, ctx: Context): Promise<T> => {
    ctx.clients.externalInvoices.schema = SCHEMAS.DEFAULT
    ctx.clients.payoutReports.schema = SCHEMAS.DEFAULT
    ctx.clients.commissionInvoices.schema = SCHEMAS.DEFAULT
    ctx.clients.sellersDashboardClientMD.schema = SCHEMAS.DEFAULT
    ctx.clients.statisticsDashboardClientMD.schema = SCHEMAS.DEFAULT

    const result = await originalFunction(_, params, ctx)

    return result
  }
}

export const resolversWrapper = (items: {
  [key: string]: (...args: any[]) => any
}) =>
  Object.fromEntries(
    Object.entries(items).map(([name, originalFunction]) => {
      return [name, wrapperFunction(originalFunction)]
    })
  )
