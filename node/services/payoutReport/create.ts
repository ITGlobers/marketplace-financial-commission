import { format, parse } from 'date-fns'

import { DoxisCredentialsDev } from '../../environments'
import { generateFileByType } from '../../utils/generateFile'
import { payoutMapper } from '../../mappings/payoutMapper'
import { jsonStorageService } from '../jsonService'

async function createPayoutReportServices(
  ctx: Context,
  data?: any
): Promise<any> {
  const {
    clients: { doxis, payoutReports },
  } = ctx

  doxis.dmsRepositoryId = DoxisCredentialsDev.PAYOUT_REPORT

  const parsedDate = parse(data.reportCreatedDate, 'dd/MM/yyyy', new Date())

  const formattedDate = format(parsedDate, 'yyyy-MM-dd')

  const jsonData = JSON.parse(data.jsonData)

  const cleanupData = payoutMapper(jsonData)

  data.id = `${data.seller.id}_${data.reportCreatedDate
    .split('/')
    .join('_')}_${data.payoutReportFileName.split('-').join('_')}`

  const existingDocument = await payoutReports.get(data.id, ['id'])

  if (existingDocument) {
    throw new Error('Document already exists')
  }

  data.jsonData = cleanupData

  try {
    await Promise.all(
      [
        {
          type: 'xls',
          mimeTypeName:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileExtension: 'xlsx',
        },
        {
          type: 'csv',
          mimeTypeName: 'text/plain',
          fileExtension: 'csv',
        },
      ].map(async (type: any) => {
        const { type: typeFile } = type

        const file = await generateFileByType(
          data,
          typeFile as any,
          ctx,
          'payoutReport'
        )

        const currentFormatDate = parse(formattedDate, 'yyyy-MM-dd', new Date())

        const reportDate = format(currentFormatDate, 'yyyy.MM.dd')
        const fileDate = format(currentFormatDate, 'yyyyMMdd')

        type.attributes = [
          {
            attributeDefinitionUUID: '10000002-0000-9000-3030-303131303231', // Document type
            values: [type.type],
            attributeDataType: 'STRING',
          },
          // {
          //   attributeDefinitionUUID: '10000002-0000-9000-3030-303131313033', // Company code
          //   values: [],
          //   attributeDataType: 'STRING',
          // },
          {
            attributeDefinitionUUID: '10000002-0000-9000-3030-303131303830', // Country code
            values: ['DE'],
            attributeDataType: 'STRING',
          },
          {
            attributeDefinitionUUID: '10000002-0000-9000-3030-303131303236', // Date
            values: [fileDate],
            attributeDataType: 'STRING',
          },
          // {
          //   attributeDefinitionUUID: 'a1f099fc-07cd-4891-bd2f-b7d3ee674688', // Report Number
          //   values: [],
          //   attributeDataType: 'STRING',
          // },
          {
            attributeDefinitionUUID: '10000002-0000-9000-3030-303131303839', // Report Date
            values: [reportDate],
            attributeDataType: 'STRING',
          },
          // {
          //   attributeDefinitionUUID: '763aee9a-d75b-4f23-a222-3c39bc8b726b', // IBAN
          //   values: [],
          //   attributeDataType: 'STRING',
          // },
          // {
          //   attributeDefinitionUUID: '10000002-0000-9000-3030-303131313035', // Account number
          //   values: [],
          //   attributeDataType: 'STRING',
          // },
          // {
          //   attributeDefinitionUUID: '306d2ac9-7bec-4462-8a5e-b7293b635b64', // bank code
          //   values: [],
          //   attributeDataType: 'STRING',
          // },
          {
            attributeDefinitionUUID: 'a4ef5e30-c31d-42c6-9bd3-399befa0677f', // Filename
            values: [data.payoutReportFileName],
            attributeDataType: 'STRING',
          },
        ]

        const { documentWsTO }: any = await doxis.createDocument(
          data.payoutReportFileName,
          file,
          type
        )

        data = {
          ...data,
          reportCreatedDate: formattedDate,
          files: {
            ...data.files,
            [typeFile]: JSON.stringify({
              uuid: documentWsTO?.uuid,
              versionNr: 'current',
              representationId: 'default',
              contentObjectId: 'primary',
            }),
          },
        }
      })
    )
  } catch (error) {
    console.error('generate and upload file error: ', error)
  }

  data.jsonData = JSON.stringify(jsonData)

  if (jsonData.length > 1000) {
    await jsonStorageService(ctx, 'PR').save({
      id: data.id,
      jsonData: data.jsonData,
    })
    data.jsonData = ''
  }

  const document = await payoutReports.save(data)

  return document
}

export default createPayoutReportServices
