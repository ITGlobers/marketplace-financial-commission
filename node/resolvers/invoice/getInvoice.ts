import type { CommissionInvoice } from 'itglobers.marketplace-financial-commission'

import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'
import { typeIntegration } from '../../utils/typeIntegration'

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
  // const items: any[] = []

  const integration = await typeIntegration(ctx)

  // const setSymbol = (
  //   { CurrencySymbol, CurrencyFormatInfo: { StartsWithCurrencySymbol } }: any,
  //   value: number
  // ) => {
  //   if (StartsWithCurrencySymbol) {
  //     return `${CurrencySymbol} ${value}`
  //   }

  //   return `${value.toFixed(2)} ${CurrencySymbol}`
  // }

  if (TypeIntegration.external === integration) {
    const externalInvoice = await externalInvoices.search(
      { page: PAGE_DEFAULT, pageSize: PAGE_SIZE_DEFAULT },
      ['id,status,invoiceCreatedDate,seller,jsonData,comment'],
      '',
      where
    )

    // const sellerInfo = await sellersIO.seller(externalInvoice[0].seller?.id)
    // const culture = await catalog.salesChannelById(sellerInfo?.salesChannel)
    // const objectData = JSON.parse(externalInvoice[0].jsonData)

    // objectData.orders = objectData.orders.map((order: any) => {
    //   order.items = order.items.map((item: any) => {
    //     const { itemGrossPrice, itemTotalValue, itemCommissionAmount} = item
    //     return {
    //       ...item,
    //       orderId: order.orderId,
    //       itemGrossPrice: setSymbol(culture, itemGrossPrice),
    //       itemTotalValue: setSymbol(culture, itemTotalValue),
    //       itemCommissionAmount: setSymbol(culture, itemCommissionAmount),
    //     }
    //   })
    //   items.push(...order.items)
    //   return order
    // })
    // objectData.items = items
    // externalInvoice[0].jsonData = JSON.stringify(objectData);

    if (externalInvoice.length === 0) {
      invoice = externalInvoice
    } else {
      const jsonDataParsed = JSON.parse(externalInvoice[0].jsonData as string)
      delete externalInvoice[0].jsonData
      console.info("seller", externalInvoice[0].seller)
      invoice = [
        {
          id: externalInvoice[0].id,
          status: externalInvoice[0].status,
          invoiceCreatedDate: externalInvoice[0].invoiceCreatedDate,
          seller: externalInvoice[0].seller,
          jsonData: { ...externalInvoice[0], ...jsonDataParsed},
          comment: externalInvoice[0].comment,
        },
      ]
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

  if (invoice.length > 1) {
    console.warn('Invoice duplication, seek resolution')
  }

  if (invoice.length > 0) {
    return invoice[0]
  }

  return null
}
