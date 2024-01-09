import Handlebars from 'handlebars'

import payoutReportService from '../../services/payoutReport/search'

export async function searchPayoutReport(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    vtex: {
      route: { params },
    },
    clients: { template },
    query,
  } = ctx

  const { sellerId, startDate, endDate, page, pageSize, _fields } = query

  let response
  let html

  try {
    if (params.id !== '' && params.id !== undefined) {
      response = await payoutReportService(ctx).get(params.id.toString())

      if (_fields === 'html') {
        const templateEmail = await template.getPayoutTemplate()

        const hbTemplate = Handlebars.compile(
          templateEmail.Templates.email.Message
        )

        html = hbTemplate(response)
      }
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
    ctx.body = { ...response, html }
  } catch (error) {
    ctx.status = 404
    ctx.body = error
  }

  ctx.set('Cache-Control', 'no-cache ')
  await next()
}
