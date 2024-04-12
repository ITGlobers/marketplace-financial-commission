import { config } from '../../constants'
import type {
  EmailInvoiceData,
  InvoiceExternal,
} from '../../typings/externalInvoice'
import { ExternalLogSeverity } from '../../typings/externalLogMetadata'

export const sendEmailInvoiceExternal = async (
  ctx: Context,
  documentId: string,
  dataInvoice: InvoiceExternal
): Promise<any> => {
  const {
    clients: { mail },
    state: { logs },
  } = ctx

  try {
    const emailData: EmailInvoiceData = {
      id: documentId,
      invoiceCreatedDate: dataInvoice.invoiceCreatedDate,
      seller: dataInvoice.seller,
      status: dataInvoice.status,
      jsonData: JSON.parse(dataInvoice.jsonData),
    }

    await mail.sendMail({
      templateName: config.INVOICE_MAIL_TEMPLATE,
      jsonData: {
        message: {
          to: dataInvoice.seller.contact.email,
        },
        ...emailData,
      },
    })
  } catch (error) {
    logs.push({
      message: 'Error while sending the email',
      middleware: 'Middlewares/Invoice External/sendEmailInvoiceExternal',
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: error.message,
        stack: error.stack,
      },
    })
  }
}
