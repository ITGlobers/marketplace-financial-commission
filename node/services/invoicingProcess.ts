import type { CommissionInvoice } from 'obi.marketplace-financial-commission'
import { v4 as uuidv4 } from 'uuid'

import { config, JOB_STATUS, TYPES } from '../constants'
import { ExternalLogSeverity } from '../typings/externalLogMetadata'
import { draftInvoice } from '../utils/draftInvoice'
import { randomId } from '../utils/randomId'

interface JobHistory {
  referenceId: string | null
  sellerId: string
  status: JobStatus
  message: string | null
}

type JobStatus = 'ONGOING' | 'COMPLETE' | 'ERROR' | 'OMITTED'

type BodyInvoice = CommissionInvoice & {
  id: string
  jsonData: string
  files: Record<string, string>
}

/**
 * @description
 * Attempts to save a Commission Invoice document in MasterData.
 * @param sellerData
 * Data required to submit a document to the data entity
 * - id (Seller id)
 * - name (Seller name)
 * - email (Seller email)
 * - startDate (Orders lookup start)
 * - endDate (Orders lookup end)
 * @param automated
 * Used to either state the invoice was made manually or automatically
 * @returns
 * - If no orders are available, returns an 'omitted' message
 * - If the process completed, returns the masterdata document ID
 */
export const invoicingProcess = async (
  ctx: Context,
  sellerData: SellerInvoice,
  automated?: boolean
): Promise<string> => {
  const {
    clients: { vbase, commissionInvoices, mail },
    state: { logs },
    vtex: { account: marketplace },
  } = ctx

  const [today] = new Date().toISOString().split('T')

  const { id: sellerId, name: SELLER_NAME, email } = sellerData

  const BUCKET = automated ? config.AUTO_JOB_BUCKET : config.MANUAL_JOB_BUCKET

  const HISTORY: JobHistory = {
    referenceId: null,
    sellerId,
    status: JOB_STATUS.ONGOING,
    message: null,
  }

  await vbase.saveJSON<JobHistory>(BUCKET, SELLER_NAME, HISTORY)

  const invoice = await draftInvoice(ctx, sellerData)

  if (!invoice) {
    HISTORY.status = JOB_STATUS.OMITTED
    HISTORY.message = `No eligible orders to invoice between ${sellerData.startDate} and ${sellerData.endDate}`

    await vbase.saveJSON<JobHistory>(BUCKET, SELLER_NAME, HISTORY)

    return HISTORY.status
  }

  if (automated) {
    invoice.comment = `Invoice manually created on ${today}`
  }

  const idInvoice = randomId(sellerData.id)

  const bodyInvoiceWithId: BodyInvoice = {
    ...invoice,

    id: idInvoice,
    jsonData: JSON.stringify(invoice),
    files: {},
  }

  await Promise.all(
    TYPES.map(async ({ type: typeFile }: Type) => {
      try {
        bodyInvoiceWithId.files[typeFile] = JSON.stringify({
          uuid: uuidv4(),
          versionNr: 'current',
          representationId: 'default',
          contentObjectId: 'primary',
        })
      } catch (error) {
        logs.push({
          message: 'Error while setting the files',
          middleware: 'Services/InvoicingProcess',
          severity: ExternalLogSeverity.ERROR,
          payload: {
            details: error.message,
            stack: error.stack,
            typeFile,
          },
        })
      }
    })
  )
  const document = await commissionInvoices.save(bodyInvoiceWithId)

  const idBucket = marketplace
  const configRes = await vbase.getJSON<any>(config.SETTINGS_BUCKET, idBucket)

  configRes.showStatus &&
    (await mail.sendMail({
      templateName: config.INVOICE_MAIL_TEMPLATE,
      jsonData: {
        message: {
          to: email,
        },
        ...invoice,
      },
    }))

  await vbase.saveJSON<JobHistory>(BUCKET, SELLER_NAME, {
    ...HISTORY,
    referenceId: document.DocumentId,
    status: JOB_STATUS.COMPLETE,
  })

  /**
   * @todo save new dates for seller settings
   */

  return document.DocumentId
}
