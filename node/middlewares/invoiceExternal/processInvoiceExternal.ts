import type { DocumentResponse } from '@vtex/clients/build/clients/masterData'
import type { ExternalInvoice } from 'itglobers.marketplace-financial-commission'

import { config, JOB_STATUS } from '../../constants'
import type { InvoiceExternal } from '../../typings/externalInvoice'
import { randomId } from '../../utils/randomId'
import { generateFileByType } from '../../utils/generateFile'
import { DoxisCredentials } from '../../environments'

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
  } = ctx

  const [today] = new Date().toISOString().split('T')

  const BUCKET = config.APIREST_JOB_BUCKET

  doxis.dmsRepositoryId = DoxisCredentials.COMMISSION_REPORT

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

  try {
    await Promise.all(
      ['csv', 'xls'].map(async (type: any) => {
        const file = await generateFileByType(bodyExternalInvoiceWithId, type)

        const document: any = await doxis.createDocument(idInvoice, file, type)

        console.log('document', document)

        bodyExternalInvoiceWithId = {
          ...bodyExternalInvoiceWithId,
          files: {
            ...bodyExternalInvoiceWithId.files,
            [type]: JSON.stringify({
              uuid: document?.uuid,
              versionNr: 'current',
              representationId: 'default',
              contentObjectId: 'primary',
            }),
          },
        }
      })
    )
  } catch (error) {
    // ts-ignore
    console.error('error', error.message)
  }

  bodyExternalInvoiceWithId.files = {
    csv: '{"uuid":"b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2","versionNr":"current","representationId":"default","contentObjectId":"primary"}',
  } // while not used
  const document = await externalInvoices.save(bodyExternalInvoiceWithId)

  await vbase.saveJSON<JobHistory>(BUCKET, dataInvoice.seller.id, {
    ...HISTORY,
    referenceId: document.DocumentId,
    status: JOB_STATUS.COMPLETE,
  })

  return document
}
