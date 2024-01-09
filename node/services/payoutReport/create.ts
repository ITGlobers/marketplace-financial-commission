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

  doxis.dmsRepositoryId = DoxisCredentialsDev.COMMISSION_REPORT

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

  return payoutReports.save(data)
}

export default createPayoutReportServices
