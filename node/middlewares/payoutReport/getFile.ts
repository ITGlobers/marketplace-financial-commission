import { TYPES } from '../../constants'
import { DoxisCredentialsDev } from '../../environments'

export async function getPayoutReportFile(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    vtex: {
      route: {
        params: { id, type },
      },
    },
    clients: { payoutReports, doxis },
  } = ctx

  doxis.dmsRepositoryId = DoxisCredentialsDev.COMMISSION_REPORT

  const { files, payoutReportFileName }: any = await payoutReports.get(
    id.toString(),
    ['id,files,payoutReportFileName']
  )

  const fileData = JSON.parse(files[`${type}`])
  const file = await doxis.getDocument(fileData)
  const contentType = TYPES.find((t) => t.type === type)?.mimeTypeName as string

  ctx.status = 200
  ctx.set('Content-Type', contentType)
  ctx.set(
    'Content-Disposition',
    `attachment; filename=${payoutReportFileName}.${type}`
  )
  ctx.body = file
  ctx.set('Cache-Control', 'no-cache ')

  await next()
}
