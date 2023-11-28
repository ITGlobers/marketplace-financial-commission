import { DoxisCredentialsDev } from '../../environments'
import { generateFileByType } from '../../utils/generateFile'
import { randomId } from '../../utils/randomId'

async function createPayoutReportServices(
  ctx: Context,
  data?: any
): Promise<any> {
  const {
    clients: { doxis, payoutReports },
  } = ctx

  doxis.dmsRepositoryId = DoxisCredentialsDev.COMMISSION_REPORT

  let payoutToSave = data

  const idPayoutReport = randomId(data.seller.id)

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
          payoutToSave,
          typeFile as any,
          ctx,
          'payoutReport'
        )

        const { documentWsTO }: any = await doxis.createDocument(
          idPayoutReport,
          file,
          type
        )

        function convertDateFormat(dateString: string) {
          const parts = dateString.split('/')

          return `${parts[2]}-${parts[0]}-${parts[1]}`
        }

        const covertedDate = convertDateFormat(payoutToSave.reportCreatedDate)

        payoutToSave = {
          ...payoutToSave,
          reportCreatedDate: covertedDate,
          files: {
            ...payoutToSave.files,
            [typeFile]: JSON.stringify({
              uuid: documentWsTO?.uuid,
              versionNr: 'current',
              representationId: 'default',
              contentObjectId: 'primary',
            }),
          },
        }
        console.info(payoutToSave)
      })
    )
  } catch (error) {
    console.error('generate and upload file error: ', error)
  }

  return payoutReports.save(payoutToSave)
}

export default createPayoutReportServices
