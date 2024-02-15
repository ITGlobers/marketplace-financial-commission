import { typeIntegration } from '../../utils/typeIntegration'

export async function getInvoiceExternalFile(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    vtex: {
      route: {
        params: { id },
      },
    },
    clients: { commissionInvoices, externalInvoices },
  } = ctx

  const pagination = {
    page: 1,
    pageSize: 100,
  }

  const integration = await typeIntegration(ctx)

  let sellerInvoices: any

  if (TypeIntegration.external === integration) {
    sellerInvoices = await externalInvoices.searchRaw(
      pagination,
      [
        'id,status,accountName,seller,invoiceCreatedDate,jsonData,comment,files',
      ],
      'createdIn',
      `id=${id}`
    )
  } else {
    sellerInvoices = await commissionInvoices.searchRaw(
      pagination,
      [
        'id,status,accountName,seller,invoiceCreatedDate,jsonData,comment,files',
      ],
      'createdIn',
      `id=${id}`
    )
  }

  ctx.status = 404
  ctx.set('Cache-Control', 'no-cache ')

  await next()
}
