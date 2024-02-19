import { createTemplate } from "../../utils/createTemplate"

export async function templateMethod(ctx: Context, next: () => Promise<any>) {
  ctx.body = createTemplate(ctx.clients)
  ctx.set('Cache-Control', 'no-cache')
  await next()
}
