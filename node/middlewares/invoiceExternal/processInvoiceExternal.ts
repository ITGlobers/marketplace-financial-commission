import type { DocumentResponse } from '@vtex/clients/build/clients/masterData'
import type { ExternalInvoice } from 'obi.marketplace-financial-commission'
import { format, parse } from 'date-fns'

import { config, JOB_STATUS, TYPES } from '../../constants'
import type { InvoiceExternal } from '../../typings/externalInvoice'
import { generateFileByType } from '../../utils/generateFile'
import { DoxisCredentialsDev } from '../../environments'
import { invoiceMapper } from '../../mappings/invoiceMapper'
import { jsonDataMapper } from '../../mappings/jsonDataMapper'
import { jsonStorageService } from '../../services/jsonService'

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

  const jsonData = JSON.parse(dataInvoice.jsonData)

  const isOutbound =
    jsonData.orders[0].items[0].positionType === 'outbound'
      ? 'Rechnung'
      : 'Gutschrift'

  const idInvoice = `${
    dataInvoice.seller.id
  }_${bodyExternalInvoice.invoiceCreatedDate.replace(/-/g, '')}_${
    jsonData.sapCommissionId
  }_${isOutbound}`

  let bodyExternalInvoiceWithId = {
    id: idInvoice,
    ...bodyExternalInvoice,
  }

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
        console.info('Error generating file', error)
        throw new Error(
          error?.response?.data?.message ??
            "It wasn't possible to generate file by type."
        )
      }

      const currentFormatDate = parse(
        dataInvoice.invoiceCreatedDate,
        'yyyy-MM-dd',
        new Date()
      )

      const reportDate = format(currentFormatDate, 'yyyy.MM.dd')
      const fileDate = format(currentFormatDate, 'yyyyMMdd')

      type.attributes = [
        {
          attributeDefinitionUUID: '10000002-0000-9000-3030-303131303839', // Report Date (yyyy.mm.dd)
          values: [reportDate],
          attributeDataType: 'STRING',
        },
        {
          attributeDefinitionUUID: '10000002-0000-9000-3030-303131303236', // Date (yyyyMMdd)
          values: [fileDate],
          attributeDataType: 'STRING',
        },
        {
          attributeDefinitionUUID: '10000002-0000-9000-3030-303131303231', // Document type
          values: [type.type],
          attributeDataType: 'STRING',
        },
        {
          attributeDefinitionUUID: '10000002-0000-9000-3030-303131303830', // Country code
          values: ['DE'],
          attributeDataType: 'STRING',
        },
        {
          attributeDefinitionUUID: '22c73bc8-6c1a-4a21-ae61-cbbb203b594d', // Seller ID
          values: [dataInvoice.seller.id],
          attributeDataType: 'STRING',
        },
        {
          attributeDefinitionUUID: 'd180776f-fedf-420e-8b28-252074e3fda4', // invoice ID
          values: [bodyExternalInvoiceWithId.id],
          attributeDataType: 'STRING',
        },
      ]

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

  const jsonOrders = JSON.parse(bodyExternalInvoiceWithId.jsonData)

  if (jsonOrders.orders.length > 1000) {
    await jsonStorageService(ctx, 'CR').save(bodyExternalInvoiceWithId)
    delete jsonOrders.orders
    bodyExternalInvoiceWithId.jsonData = JSON.stringify(jsonOrders)
  }

  const document = await externalInvoices.save(bodyExternalInvoiceWithId)

  await vbase.saveJSON<JobHistory>(BUCKET, dataInvoice.seller.id, {
    ...HISTORY,
    referenceId: document.DocumentId,
    status: JOB_STATUS.COMPLETE,
  })

  return document
}
