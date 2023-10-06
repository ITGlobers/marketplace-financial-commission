import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'
import { typeIntegration } from '../../utils/typeIntegration'

export const invoicesBySeller = async (
  _: unknown,
  params: any,
  ctx: Context
): Promise<any> => {
  const {
    clients: { commissionInvoices, externalInvoices },
  } = ctx

  const {
    sellerName,
    sellerId,
    pagination: { page = PAGE_DEFAULT, pageSize = PAGE_SIZE_DEFAULT },
    dates: { startDate, endDate },
  } = params.sellerInvoiceParams

  console.info('seller: ', sellerName, sellerId)

  const where = `(seller.id="${sellerId}" OR seller.name="${sellerName}") AND (invoiceCreatedDate between ${startDate} AND ${endDate})`

  const fields = ['id', 'status', 'invoiceCreatedDate', 'totalizers', 'seller']

  const pagination = { page, pageSize }

  let sellerInvoices

  const integration = await typeIntegration(ctx)

  if (TypeIntegration.external === integration) {
    const whereExternal = `(seller.id="${sellerId}" OR seller.name="${sellerName}") AND (invoiceCreatedDate between ${startDate} AND ${endDate})`

    const fieldsExternal = [
      'id',
      'status',
      'invoiceCreatedDate',
      'jsonData',
      'seller',
    ]

    sellerInvoices = await externalInvoices.searchRaw(
      pagination,
      fieldsExternal,
      'invoiceCreatedDate DESC',
      whereExternal
    )
  } else {
    sellerInvoices = await commissionInvoices.searchRaw(
      pagination,
      fields,
      'invoiceCreatedDate DESC',
      where
    )
  }

  sellerInvoices.data = sellerInvoices.data.map((invoice: any) => {
    const { id, invoiceCreatedDate } = invoice

    const newId = `${id.split('_')[0]}_${invoiceCreatedDate.replace(
      /-/g,
      ''
    )}_${id.split('_')[id.split('_').length - 1]}`

    return {
      ...invoice,
      columnId: {
        href: id,
        idVisible: newId,
      },
      downloadFiles: {
        id,
        sellerName: invoice.seller.name,
        sellerId: invoice.seller.id,
      },
    }
  })

  return sellerInvoices
}
