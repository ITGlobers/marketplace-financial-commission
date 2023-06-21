export async function searchPayoutReport(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    clients: { payoutReports },
    vtex: {
      route: { params },
    }
  } = ctx

  let where = ''

  if (params.id !== '' && params.id !== undefined) {
    where = `id=${params.id}`
  }

  try {
    const payoutResports = await payoutReports.search(
      { page: 1, pageSize: 10 },
      ['_all'],
      'id DESC',
      where
    )

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
