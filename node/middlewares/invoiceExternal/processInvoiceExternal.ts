import type { DocumentResponse } from '@vtex/clients/build/clients/masterData'
import type { ExternalInvoice } from 'obi.marketplace-financial-commission'

import { config, JOB_STATUS, TYPES } from '../../constants'
import type { InvoiceExternal } from '../../typings/externalInvoice'
import { randomId } from '../../utils/randomId'
import { generateFileByType } from '../../utils/generateFile'
import { DoxisCredentialsDev } from '../../environments'
import { invoiceMapper } from '../../mappings/invoiceMapper'
import { jsonDataMapper } from '../../mappings/jsonDataMapper'
import { removeDash } from '../../utils/dashRemover'
import { ExternalLogSeverity } from '../../typings/externalLogMetadata'

interface JobHistory {
  referenceId: string | null
  sellerId: string
  status: JobStatus
  message: string | null
}

type JobStatus = 'ONGOING' | 'COMPLETE' | 'ERROR' | 'OMITTED'

export const processInvoiceExternal = async (
  ctx: Context,
  dataInvoice: InvoiceExternal
): Promise<DocumentResponse> => {
  const {
    clients: { vbase, externalInvoices, doxis },
    state: { logs },
  } = ctx

  const [today] = new Date().toISOString().split('T')

  try {
    const BUCKET = config.APIREST_JOB_BUCKET

    doxis.dmsRepositoryId = DoxisCredentialsDev.COMMISSION_REPORT

    const HISTORY = {
      referenceId: null,
      sellerId: dataInvoice.seller.id,
      status: JOB_STATUS.ONGOING,
      message: null,
    }

    await vbase.saveJSON<JobHistory>(BUCKET, dataInvoice.seller.id, HISTORY)

    const bodyExternalInvoice: ExternalInvoice = {
      seller: {
        id: dataInvoice.seller.id,
        name: dataInvoice.seller.name,
        sapSellerId: dataInvoice.seller.sapSellerId,
        contact: {
          email: dataInvoice.seller.contact.email,
          phone: dataInvoice.seller.contact.phone,
        },
      },
      invoiceCreatedDate: dataInvoice.invoiceCreatedDate,
      status: dataInvoice.status,
      jsonData: dataInvoice.jsonData,
      comment: `Invoice created by external API REST integration on ${today}`,
    }

    const idInvoice = randomId(dataInvoice.seller.id)

    let bodyExternalInvoiceWithId = {
      id: idInvoice,
      ...bodyExternalInvoice,
    }

    const jsonData = JSON.parse(dataInvoice.jsonData)

    const isOutbound =
      jsonData.orders[0].items[0].positionType === 'outbound'
        ? 'Rechnung'
        : 'Gutschrift'

    bodyExternalInvoiceWithId.id = `${
      bodyExternalInvoiceWithId.id.split('_')[0]
    }_${removeDash(bodyExternalInvoiceWithId.invoiceCreatedDate)}_${
      jsonData.sapCommissionId
    }_${isOutbound}`

    bodyExternalInvoiceWithId.jsonData = jsonDataMapper(dataInvoice.jsonData)

    const dataToFile = {
      original: bodyExternalInvoiceWithId,
      jsonData: invoiceMapper(jsonData),
      sellerInformation: [
        {
          ID: idInvoice,
          'Seller ID': dataInvoice.seller.id,
          'Seller Name': dataInvoice.seller.name,
          'SAP Seller ID': dataInvoice.seller.sapSellerId,
          'Invoiced Created': dataInvoice.invoiceCreatedDate,
          'SellerInvoiceID ': jsonData.sapCommissionId,
        },
      ],
    }

    await Promise.all(
      TYPES.map(async (type: Type) => {
        const { type: typeFile } = type
        let file

        try {
          file = await generateFileByType(
            dataToFile,
            typeFile as any,
            ctx,
            'commissionReport'
          )
        } catch (error) {
          throw new Error(
            error?.response?.data?.message ??
              "It wasn't possible to generate file by type."
          )
        }

        try {
          const { documentWsTO }: any = await doxis.createDocument(
            idInvoice,
            file,
            type
          )

          bodyExternalInvoiceWithId = {
            ...bodyExternalInvoiceWithId,
            files: {
              ...bodyExternalInvoiceWithId.files,
              [typeFile]: JSON.stringify({
                uuid: documentWsTO?.uuid,
                versionNr: 'current',
                representationId: 'default',
                contentObjectId: 'primary',
              }),
            },
          }
        } catch (error) {
          throw new Error(
            error?.response?.data?.message ??
              "It wasn't possible to create document in doxis."
          )
        }
      })
    )

    const document = await externalInvoices.save(bodyExternalInvoiceWithId)

    await vbase.saveJSON<JobHistory>(BUCKET, dataInvoice.seller.id, {
      ...HISTORY,
      referenceId: document.DocumentId,
      status: JOB_STATUS.COMPLETE,
    })

    return document
  } catch (error) {
    logs.push({
      message: 'Error while uploading the document to Doxis',
      middleware: 'Process Invoice External',
      severity: ExternalLogSeverity.ERROR,
      payload: {
        details: error.message,
        stack: error?.stack,
      },
    })
    throw error
  }
}
