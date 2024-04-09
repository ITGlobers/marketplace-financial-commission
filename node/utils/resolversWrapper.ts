import { errorHandler } from '../middlewares'
import setApplicationSettings from '../middlewares/setApplicationSettings'
import { setSchemaVersion } from '../middlewares/setSchema'

type ResolverCallback = (...args: any[]) => Promise<any>
interface ContextFunction<T> {
  (_: any, params: any, ctx: Context): Promise<T>
}
type WrappedFunction = (_: any, params: any, ctx: Context) => Promise<void>

export const wrapperFunction = <T>(
  originalFunction: ContextFunction<T>
): WrappedFunction => {
  const nextHandler = () => Promise.resolve()

  return async (_: any, params: any, ctx: Context) => {
    await errorHandler(ctx, async () => {
      await setApplicationSettings(ctx, nextHandler)
      await setSchemaVersion(ctx, nextHandler)

      await originalFunction(_, params, ctx)
    })
  }
}

export const resolversWrapper = (items: Record<string, ResolverCallback>) => {
  const mappedResolvers: Record<string, WrappedFunction> = {}

  for (const key in items) {
    mappedResolvers[key] = wrapperFunction(items[key])
  }

  return mappedResolvers
}
