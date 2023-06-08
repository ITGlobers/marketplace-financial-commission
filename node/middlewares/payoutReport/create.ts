import { json } from 'co-body'

export async function createPayoutReport(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    clients: { payoutReports },
  } = ctx

  const body = await json(ctx.req)

  try {
    const response = await payoutReports.save(body)

    ctx.status = 200
    ctx.body = { message: 'Payout report created', ...response }
  } catch (error) {
    console.error(error.message)

    ctx.status = 404
    ctx.body = { error: 'Error creating payout report' }
  }

  ctx.set('Cache-Control', 'no-cache ')
  await next()
}
