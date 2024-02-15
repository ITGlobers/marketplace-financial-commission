import type { DocumentResponse } from '@vtex/clients/build/clients/masterData'
import type { ExternalInvoice } from 'obi.marketplace-financial-commission'
import { v4 as uuidv4 } from 'uuid';

import { config, JOB_STATUS, TYPES } from '../../constants'
import type { InvoiceExternal } from '../../typings/externalInvoice'
import { randomId } from '../../utils/randomId'
import { jsonDataMapper } from '../../mappings/jsonDataMapper'

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
    clients: { vbase, externalInvoices },
  } = ctx

  const [today] = new Date().toISOString().split('T')

  const BUCKET = config.APIREST_JOB_BUCKET

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
  }_${bodyExternalInvoiceWithId.invoiceCreatedDate.replace(/-/g, '')}_${
    jsonData.sapCommissionId
  }_${isOutbound}`
  bodyExternalInvoiceWithId.jsonData = jsonDataMapper(dataInvoice.jsonData)

  try {
    await Promise.all(
      TYPES.map(async (type: Type) => {
        const { type: typeFile } = type

        bodyExternalInvoiceWithId = {
          ...bodyExternalInvoiceWithId,
          files: {
            ...bodyExternalInvoiceWithId.files,
            [typeFile]: JSON.stringify({
              uuid: uuidv4(),
              versionNr: 'current',
              representationId: 'default',
              contentObjectId: 'primary',
            }),
          },
        }
      })
    )
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ??
        "It wasn't possible to create the invoice."
    )
  }

  const document = await externalInvoices.save(bodyExternalInvoiceWithId)

  await vbase.saveJSON<JobHistory>(BUCKET, dataInvoice.seller.id, {
    ...HISTORY,
    referenceId: document.DocumentId,
    status: JOB_STATUS.COMPLETE,
  })

  return document
}
