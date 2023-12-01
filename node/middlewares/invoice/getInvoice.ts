import { AuthenticationError } from '@vtex/api'
import type { CommissionInvoice } from 'obi.marketplace-financial-commission'

import { typeIntegration } from '../../utils/typeIntegration'

/**
 * @description Retrieves a specific Invoice by ID.
 */
export async function getInvoice(ctx: Context): Promise<any> {
  const {
    query: { sellerName },
    vtex: {
      route: {
        params: { id },
      },
    },
    // params: { id },
    clients: { commissionInvoices, externalInvoices },
    state: {
      body: { seller },
    },
  } = ctx

  /* This means the seller wants to access other seller's invoices */
  if (sellerName !== seller.name) {
    throw new AuthenticationError(`Cannot access invoices for ${seller.name}`)
  }

  let invoice

  const integration = await typeIntegration(ctx)

  if (TypeIntegration.external === integration) {
    invoice = await externalInvoices.get(id as string, [
      'id,status,invoiceCreatedDate,seller,jsonData,comment',
    ])
  } else {
    const internalInvoice = (await commissionInvoices.get(id as string, [
      'id,status,invoiceCreatedDate,seller,orders,totalizers,comment',
    ])) as unknown as CommissionInvoice

    const orders: any[] = internalInvoice.orders.map((order) => {
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
        id: internalInvoice.id as string,
        status: internalInvoice.status as string,
        invoiceCreatedDate: internalInvoice.invoiceCreatedDate as string,
        seller: internalInvoice.seller,
        orders,
        totalizers: {
          subTotal: internalInvoice.totalizers.subTotal?.toFixed(2),
          fee: internalInvoice.totalizers.fee?.toFixed(2),
          total: internalInvoice.totalizers.total?.toFixed(2),
        },
        comment: internalInvoice.comment,
      },
    ]
  }

  return invoice
}
