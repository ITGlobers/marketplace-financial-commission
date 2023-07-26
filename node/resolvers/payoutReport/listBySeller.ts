export async function searchPayoutReport(
  _: unknown,
  params: any,
  ctx: Context
) {
  const {
    clients: { payoutReports },
  } = ctx

  const { id } = params

  let where

  if (id !== undefined) {
    where = `id=${id}`
  }

  try {
    const response = await payoutReports.search(
      { page: 1, pageSize: 10 },
      ['_all'],
      'createdIn DESC',
      where
    )

    return {
      data: response,
      paging: { total: 10, pages: 10, currentPage: 1, perPage: 10 },
    }
  } catch (error) {
    console.error(error.message)

    return { error: 'Error creating payout report' }
  }
}
