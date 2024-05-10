import payoutReportService from '../../services/payoutReport/search'

interface SearchPayoutReportParams {
  sellerId: string
  dates: {
    startDate: string
    endDate: string
  }
  pagination: {
    page: number
    pageSize: number
  }
}

export async function searchPayoutReport(
  _: unknown,
  {
    searchPayoutReportParams,
  }: { searchPayoutReportParams: SearchPayoutReportParams },
  ctx: Context
) {
  try {
    return payoutReportService(ctx).search(searchPayoutReportParams)
  } catch (error) {
    console.error(error.message)

    return { error: 'Error creating payout report' }
  }
}
