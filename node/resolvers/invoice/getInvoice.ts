import type { CommissionInvoice } from 'obi.marketplace-financial-commission'

import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'
import { typeIntegration } from '../../utils/typeIntegration'
import { jsonStorageService } from '../../services/jsonService'

export const getInvoice = async (
  _: unknown,
  params: any,
  ctx: Context
): Promise<any> => {
  const {
    clients: { commissionInvoices, externalInvoices },
  } = ctx

  const { id } = params

  const where = `id=${id}`

  let invoice

  const integration = await typeIntegration(ctx)

  if (TypeIntegration.external === integration) {
    const externalInvoice: any = await externalInvoices.get(id, [
      'id,status,invoiceCreatedDate,seller,jsonData,comment',
    ])

    let jsonDataParsed = JSON.parse(externalInvoice.jsonData)

    if (!jsonDataParsed.orders) {
      jsonDataParsed = await jsonStorageService(ctx, 'CR').get(id)
    }

    delete externalInvoice.jsonData
    invoice = {
      id: externalInvoice.id,
      status: externalInvoice.status,
      invoiceCreatedDate: externalInvoice.invoiceCreatedDate,
      seller: externalInvoice.seller,
      jsonData: { ...externalInvoice, ...jsonDataParsed },
      comment: externalInvoice.comment,
    }
  } else {
    const internalInvoice = (await commissionInvoices.search(
      { page: PAGE_DEFAULT, pageSize: PAGE_SIZE_DEFAULT },
      ['id,status,invoiceCreatedDate,seller,orders,totalizers,comment'],
      '',
      where
    )) as unknown as CommissionInvoice[]

    const orders: any[] = internalInvoice[0].orders.map((order: any) => {
      return {
        orderId: order.orderId as string,
        sellerOrderId: order.sellerOrderId as string,
        totalComission: order.totalComission?.toFixed(2),
        totalOrderValue: order.totalOrderValue?.toFixed(2),
        totalOrderRate: order.totalOrderRate?.toFixed(2),
      }
    })

    invoice = [
      {
        id: internalInvoice[0].id as string,
        status: internalInvoice[0].status as string,
        invoiceCreatedDate: internalInvoice[0].invoiceCreatedDate as string,
        seller: internalInvoice[0].seller,
        orders,
        totalizers: {
          subTotal: internalInvoice[0].totalizers.subTotal?.toFixed(2),
          fee: internalInvoice[0].totalizers.fee?.toFixed(2),
          total: internalInvoice[0].totalizers.total?.toFixed(2),
        },
        comment: internalInvoice[0].comment,
      },
    ]
  }

  return invoice
}
