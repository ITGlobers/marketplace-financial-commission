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

    const jsonData = JSON.parse(body.jsonData)

    const adjustmentData = jsonData.filter(
      (order: any) => !order.orderId || order.orderId === ''
    )

    adjustmentData.forEach((adjustmentItem: any) => {
      Object.keys(adjustmentItem).forEach((key) => {
        if (
          adjustmentItem[key] === null ||
          adjustmentItem[key] === undefined ||
          adjustmentItem[key] === '' ||
          adjustmentItem[key] === '-'
        ) {
          adjustmentItem[key] = '-'
        }
      })
    })

    const payoutToValidate = {
      ...body,
      seller: {
        sellerId,
        sellerName,
      },
      jsonData: jsonData.filter(
        (order: any) =>
          order.orderId && order.orderId !== '' && order.orderId !== '-'
      ),
    }

    const columnsData = payoutToValidate.jsonData.shift()

    await schemaPayoutReport.validateAsync(payoutToValidate)

    payoutToValidate.jsonData.unshift(columnsData)
    payoutToValidate.jsonData.push(...adjustmentData)

    body.jsonData = JSON.stringify(payoutToValidate.jsonData)
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
