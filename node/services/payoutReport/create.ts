import { format, parse } from 'date-fns'
import { v4 as uuidv4 } from 'uuid';
import { payoutMapper } from '../../mappings/payoutMapper'

async function createPayoutReportServices(
  ctx: Context,
  data?: any
): Promise<any> {
  const {
    clients: { payoutReports },
  } = ctx

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

        data = {
          ...data,
          reportCreatedDate: formattedDate,
          files: {
            ...data.files,
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
    console.error('generate and upload file error: ', error)
  }

  data.jsonData = JSON.stringify(jsonData)
  data.id =  `${data.seller.id}_${data.reportCreatedDate}_${data.payoutReportFileName}`
  const document = payoutReports.save(data)
  return document
}

export default createPayoutReportServices
