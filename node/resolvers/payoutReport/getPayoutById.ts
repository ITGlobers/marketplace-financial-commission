import Handlebars from 'handlebars'

import payoutReportService from '../../services/payoutReport/search'

export async function getPayout(_: any, { id }: { id: string }, ctx: Context) {
  const {
    clients: { template },
  } = ctx

  const payoutData = await payoutReportService(ctx).get(id)

  const response = await template.getPayoutTemplate()

  const hbTemplate = Handlebars.compile(response.Templates.email.Message)
  const html = hbTemplate(payoutData)

  return { ...payoutData, html }
}
