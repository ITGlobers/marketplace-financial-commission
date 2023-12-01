import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'

const payoutReportService = (ctx: Context) => ({
  get(id: string): Promise<any> {
    return ctx.clients.payoutReports.get(id, [
      'id',
      'status',
      'reportCreatedDate',
      'seller',
      'jsonData',
    ])
  },
  search(params: any): Promise<any> {
    const {
      sellerId,
      dates: { startDate, endDate },
      pagination: { page = PAGE_DEFAULT, pageSize = PAGE_SIZE_DEFAULT },
    } = params

    const where = `seller.id="${sellerId}" AND (reportCreatedDate between ${startDate} AND ${endDate})`

    const fields = [
      'id',
      'status',
      'reportCreatedDate',
      'seller',
      'jsonData',
      '_all',
    ]

    return ctx.clients.payoutReports.searchRaw(
      { page, pageSize },
      fields,
      'reportCreatedDate DESC',
      where
    )
  },
})

export default payoutReportService
