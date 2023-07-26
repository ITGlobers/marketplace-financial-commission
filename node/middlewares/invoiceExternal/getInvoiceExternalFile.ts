import { TYPES } from '../../constants'
import { DoxisCredentials } from '../../environments'
import { typeIntegration } from '../../utils/typeIntegration'

export async function getInvoiceExternalFile(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    vtex: {
      route: {
        params: { id, type },
      },
    },
    clients: { commissionInvoices, externalInvoices, doxis },
  } = ctx

  doxis.dmsRepositoryId = DoxisCredentials.COMMISSION_REPORT

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

  const fileData = JSON.parse(sellerInvoices.data[0].files[`${type}`])
  const file = await doxis.getDocument(fileData)
  const contentType = TYPES.find((t) => t.type === type)?.mimeTypeName as string

  ctx.status = 200
  ctx.set('Content-Type', contentType)
  ctx.set('Content-Disposition', `attachment; filename=${id}.${type}`)
  ctx.body = file
  ctx.set('Cache-Control', 'no-cache ')

  await next()
}
