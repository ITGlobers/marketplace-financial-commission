export async function listPayoutReport(_: unknown, params: any, ctx: Context) {
  const {
    clients: { payoutReports },
  } = ctx

  console.info('params', params)

  try {
    const response = await payoutReports.search({ page: 1, pageSize: 10 }, ['_all'])

    console.info(response)

    return { data: response, pagination: { page: 1, pageSize: 10 } }
  } catch (error) {
    console.error(error.message)

    return { error: 'Error creating payout report'}
  }
}
