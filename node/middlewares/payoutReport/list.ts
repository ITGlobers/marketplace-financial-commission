export async function listPayoutReport(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { payoutReports },
    vtex: {
      route: { params },
    },
    query,
  } = ctx

  console.info('params', params)
  console.info('query', query)

  try {
    const payoutResports = await payoutReports.search(
      { page: 1, pageSize: 10 },
      ['_all']
    )

    console.info(payoutResports)
    ctx.status = 200
    ctx.body = payoutResports
  } catch (error) {
    console.error(error.message)

    ctx.status = 404
    ctx.body = { error: 'Error creating payout report' }
  }

  ctx.set('Cache-Control', 'no-cache ')
  await next()
}
