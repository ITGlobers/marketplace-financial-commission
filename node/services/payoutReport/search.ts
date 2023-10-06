import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'

const payoutReportService = (ctx: Context) => ({
  get(id: string): Promise<any> {
    return ctx.clients.payoutReports.get(id, ['_all'])
  },
  search(params: any): Promise<any> {
    const {
      sellerName,
      dates: { startDate, endDate },
      pagination: { page = PAGE_DEFAULT, pageSize = PAGE_SIZE_DEFAULT },
    } = params

    console.info('params', params)

    const where = `seller.name="${sellerName}" AND (reportCreatedDate between ${startDate} AND ${endDate})`

    const fields = ['id', 'status', 'reportCreatedDate', 'seller', 'jsonData']

    return ctx.clients.payoutReports.searchRaw(
      { page, pageSize },
      fields,
      'reportCreatedDate DESC',
      where
    )
  },
})

export default payoutReportService
