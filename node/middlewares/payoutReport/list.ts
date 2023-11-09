import payoutReportService from '../../services/payoutReport/search'

export async function searchPayoutReport(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    vtex: {
      route: { params },
    },
    query,
  } = ctx

  const { sellerId, startDate, endDate, page, pageSize } = query

  let response

  try {
    if (params.id !== '' && params.id !== undefined) {
      response = await payoutReportService(ctx).get(params.id.toString())
    } else {
      const payoutResports = await payoutReportService(ctx).search({
        sellerId,
        dates: {
          startDate,
          endDate,
        },
        pagination: {
          page,
          pageSize,
        },
      })

      const payoutResportsResonse = payoutResports.data.map(
        (payoutReport: any) => {
          const jsonData = JSON.parse(payoutReport.jsonData)
          const headline = jsonData.shift()

          return {
            ...payoutReport,
            headline,
            jsonData: JSON.stringify(jsonData),
          }
        }
      )

      response = {
        data: payoutResportsResonse,
        pagination: payoutResports.pagination,
      }
    }

    ctx.status = 200
    ctx.body = response
  } catch (error) {
    ctx.status = 404
    ctx.body = error
  }

  ctx.set('Cache-Control', 'no-cache ')
  await next()
}
