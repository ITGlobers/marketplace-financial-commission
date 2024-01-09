import { SCHEMAS } from '../constants'

interface ContextFunction<T> {
  (_: any, params: any, ctx: Context): Promise<T>
}

export const wrapperFunction = <T>(originalFunction: ContextFunction<T>) => {
  return async (_: any, params: any, ctx: Context): Promise<T> => {
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
