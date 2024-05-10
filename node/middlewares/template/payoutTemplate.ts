import GetPayoutReportBody from '../../templates/payoutReport'

export async function payoutTemplateMethod(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    clients: { template },
  } = ctx

  const templateResponse = await template.getPayoutTemplate()

  if (templateResponse) {
    ctx.body = { template: templateResponse }
  } else {
    const templateBody = await GetPayoutReportBody(ctx)
    const templateCreated = await template.publishTemplate(templateBody)

    ctx.body = { template: templateCreated }
  }

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
