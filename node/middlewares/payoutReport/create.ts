import { json } from 'co-body'

import createPayoutReportServices from '../../services/payoutReport/create'
import schemaPayoutReport from '../../validations/payoutReport'

export async function createPayoutReport(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    req,
    state: {
      body: {
        seller: { id: sellerId, name: sellerName },
      },
    },
  } = ctx

  try {
    const body = await json(req)

    const payoutToValidate = {
      ...body,
      seller: {
        sellerId,
        sellerName,
      },
      jsonData: JSON.parse(body.jsonData).map((item: any) => ({
        ...item,
        sellerId,
      })),
    }

    payoutToValidate.jsonData.shift()
    await schemaPayoutReport.validateAsync(payoutToValidate)
    const { DocumentId } = await createPayoutReportServices(ctx, body)

    ctx.status = 200
    ctx.body = { message: 'Created payout report', DocumentId }
  } catch (error) {
    ctx.status = 404
    ctx.body = { errors: error.details[0].message }
  }

  ctx.set('Cache-Control', 'no-cache ')
  await next()
}
