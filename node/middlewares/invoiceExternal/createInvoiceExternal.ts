import { NotFoundError, UserInputError } from '@vtex/api'

import { processInvoiceExternal } from './processInvoiceExternal'
import { sendEmailInvoiceExternal } from './sendEmailInvoiceExternal'
import { validateDateFormat } from '../validationParams'
import { ExternalLogSeverity } from '../../typings/externalLogMetadata'

export async function createInvoiceExternal(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    state: {
      body: { requestData },
      logs,
    },
    clients: { sellersIO },
  } = ctx

  if (!validateDateFormat(requestData.invoiceCreatedDate)) {
    throw new UserInputError(
      'Invalid date format. The date format is yyyy-mm-dd.'
    )
  }

  const responseSeller = await sellersIO.seller(requestData.seller.id)

  if (!responseSeller) {
    throw new NotFoundError('Seller not found')
  }

  let status
  let body

  const documentMD = await processInvoiceExternal(ctx, requestData)
  const { DocumentId } = documentMD
  const documentId = DocumentId

  if (documentId) {
    try {
      await sendEmailInvoiceExternal(ctx, documentId, requestData)
    } catch (error) {
      logs.push({
        message: 'Error while sending the email',
        middleware: 'Middlewares/Invoice External/createInvoiceExternal',
        severity: ExternalLogSeverity.ERROR,
        payload: {
          details: error.message,
          stack: error.stack,
        },
      })
    }

    status = 200
    body = {
      message: `Invoice Created, Shortly you will receive an email with the invoice created to your email address. ${requestData.seller.contact.email}`,
      id: documentId,
    }
  } else {
    status = 400
    body = {
      message: `It was not possible to register in master data document Id null`,
      exception: documentMD,
      body: requestData,
    }
  }

  ctx.status = status
  ctx.body = body
  ctx.set('Cache-Control', 'no-cache ')

  await next()
}
