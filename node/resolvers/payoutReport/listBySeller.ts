import payoutReportService from '../../services/payoutReport/search'
import { ExternalLogSeverity } from '../../typings/externalLogMetadata'

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
  const {
    state: { logs },
  } = ctx

  try {
    return payoutReportService(ctx).search(searchPayoutReportParams)
  } catch (error) {
    logs.push({
      message: 'Error while searching the payout report',
      middleware: 'Resolvers/PayoutReport/ListBySeller',
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: error.message,
        stack: error.stack,
      },
    })

    return { error: 'Error creating payout report' }
  }
}
