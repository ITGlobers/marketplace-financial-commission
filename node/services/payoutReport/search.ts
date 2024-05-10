import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'
import { jsonStorageService } from '../jsonService'

const payoutReportService = (ctx: Context) => ({
  async get(id: string): Promise<any> {
    const response: any = await ctx.clients.payoutReports.get(id, [
      'id',
      'status',
      'reportCreatedDate',
      'payoutReportFileName',
      'seller',
      'jsonData',
    ])

    if (response.jsonData === '') {
      const [columnsName, ...orders] = await jsonStorageService(ctx, 'PR').get(
        id
      )

      return { ...response, columns: columnsName, orders }
    }

    const [columnsName, ...orders] = JSON.parse(response.jsonData)

    return { ...response, columns: columnsName, orders }
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
      'createdIn DESC',
      where
    )
  },
})

export default payoutReportService
