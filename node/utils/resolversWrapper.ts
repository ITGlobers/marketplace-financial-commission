import { SCHEMAS } from '../constants'

type ResolverCallback = (...args: unknown[]) => Promise<unknown>
interface ContextFunction<T> {
  (_: any, params: any, ctx: Context): Promise<T>
}
type WrappedFunction<T> = (_: any, params: any, ctx: Context) => Promise<T>

export const wrapperFunction = <T>(
  originalFunction: ContextFunction<T>
): WrappedFunction<T> => {
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

export const resolversWrapper = (items: Record<string, ResolverCallback>) => {
  const mappedResolvers: Record<string, WrappedFunction<unknown>> = {}

  for (const key in items) {
    mappedResolvers[key] = wrapperFunction(items[key])
  }

  return mappedResolvers
}
