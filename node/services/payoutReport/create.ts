import { format, parse } from 'date-fns'

import { DoxisCredentialsDev } from '../../environments'
import { generateFileByType } from '../../utils/generateFile'
import { randomId } from '../../utils/randomId'
import { payoutMapper } from '../../mappings/payoutMapper'

async function createPayoutReportServices(
  ctx: Context,
  data?: any
): Promise<any> {
  const {
    clients: { doxis, payoutReports },
  } = ctx

  doxis.dmsRepositoryId = DoxisCredentialsDev.PAYOUT_REPORT

  const idPayoutReport = randomId(data.seller.id)

  const parsedDate = parse(data.reportCreatedDate, 'dd/MM/yyyy', new Date())

  const formattedDate = format(parsedDate, 'yyyy-MM-dd')

  const jsonData = JSON.parse(data.jsonData)

  const cleanupData = payoutMapper(jsonData)

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

        // type.attributes = [
        //   {
        //     attributeDefinitionUUID: '10000002-0000-9000-3030-303131303231', // Document type
        //     values: [type.type],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: '10000002-0000-9000-3030-303131313033', // Company code
        //     values: [],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: '10000002-0000-9000-3030-303131303830', // Country code
        //     values: ['DE'],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: '10000002-0000-9000-3030-303131303236', // Date
        //     values: [formattedDate],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: 'a1f099fc-07cd-4891-bd2f-b7d3ee674688', // Report Number
        //     values: [],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: '10000002-0000-9000-3030-303131303839', // Report Date
        //     values: [],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: '763aee9a-d75b-4f23-a222-3c39bc8b726b', // IBAN
        //     values: [],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: '10000002-0000-9000-3030-303131313035', // Account number
        //     values: [],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: '306d2ac9-7bec-4462-8a5e-b7293b635b64', // bank code
        //     values: [],
        //     attributeDataType: 'STRING',
        //   },
        //   {
        //     attributeDefinitionUUID: 'a4ef5e30-c31d-42c6-9bd3-399befa0677f', // Filename
        //     values: [data.payoutReportFileName],
        //     attributeDataType: 'STRING',
        //   },
        // ]

        const { documentWsTO }: any = await doxis.createDocument(
          idPayoutReport,
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
  data.id = `${data.seller.id}_${data.reportCreatedDate}_${data.payoutReportFileName}`
  const document = payoutReports.save(data)

  return document
}

export default createPayoutReportServices
