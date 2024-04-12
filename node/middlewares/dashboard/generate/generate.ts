/* eslint-disable no-await-in-loop */
import type {
  SellersDashboard,
  StatisticsDashboard,
} from 'obi.marketplace-financial-commission'

import { createKeyToken, getDatesInvoiced, numberOfDays } from '../../../utils'
import { validationParams } from '../../validationParams'
import { calculateSellers } from './calculateSellers'
import { ExternalLogSeverity } from '../../../typings/externalLogMetadata'

/* eslint-disable @typescript-eslint/restrict-plus-operands */
export async function generate(ctx: Context, next: () => Promise<Dashboards>) {
  const {
    state: {
      body: { sellers },
      logs,
    },
    clients: { sellersDashboardClientMD, statisticsDashboardClientMD },
  } = ctx

  const start = ctx.query.dateStart as string
  const end = ctx.query.dateEnd as string

  await validationParams('Generate', ctx.query)

  const numDays = numberOfDays(new Date(start), new Date(end))

  const processGenerate = async () => {
    try {
      const getDates = getDatesInvoiced({
        start,
        end,
      })

      let loop = new Date(getDates.dateInvoiceInitial)
      const endLoop = new Date(getDates.dateInvoiceEnd)
      const responseSellersMD = []
      const responseStatisticsMD = []

      while (loop <= endLoop) {
        const [dayToProcess] = loop.toISOString().split('T')

        const dateRange: DateRange = {
          start: dayToProcess,
          end: dayToProcess,
        }

        const responseCalculateSellers = await calculateSellers(
          ctx,
          sellers,
          dateRange
        )

        const {
          sellersDashboard,
          statistics: {
            ordersCount,
            totalComission,
            totalOrderValue,
            totalDiscounts,
            totalOrdersItems,
            totalShipping,
            totalTax,
          },
        } = responseCalculateSellers

        const dashboard: SellersDashboard = {
          dateCut: dayToProcess,
          sellers: sellersDashboard as [],
          idGenerate: createKeyToken(),
        }

        const dashboardWithId = {
          id: `DSH-${ctx.vtex.account}-${dayToProcess}`,
          ...dashboard,
        }

        const dashboardSaveMD = await sellersDashboardClientMD.saveOrUpdate(
          dashboardWithId
        )

        responseSellersMD.push(dashboardSaveMD)

        const statsGeneral: StatisticsDashboard = {
          dateCut: dayToProcess,
          statistics: {
            ordersCount,
            totalComission,
            totalOrderValue,
            totalDiscounts,
            totalOrdersItems,
            totalShipping,
            totalTax,
          },
          idStatistics: createKeyToken(),
        }

        const dashboardstatsWithId = {
          id: `DSH-Statistics-${ctx.vtex.account}-${dayToProcess}`,
          ...statsGeneral,
        }

        let responseStats

        try {
          responseStats = await statisticsDashboardClientMD.saveOrUpdate(
            dashboardstatsWithId
          )
          responseStatisticsMD.push(responseStats)
        } catch (err) {
          const error = err as any
          const { message, status, payload } = error

          responseStats = { message, status, payload }

          responseStatisticsMD.push(responseStats)
        }

        const newDate = loop.setDate(loop.getDate() + 1)

        loop = new Date(newDate)
      }

      const responseGenerateDashboard = {
        Sellers: responseSellersMD,
        Statistics: responseStatisticsMD,
      }

      logs.push({
        severity: ExternalLogSeverity.INFO,
        middleware: 'Dashboard/generate/generate',
        message: 'Process completed',
        payload: {
          details: {
            start,
            end,
          },
        },
      })

      return responseGenerateDashboard
    } catch (error) {
      logs.push({
        severity: ExternalLogSeverity.ERROR,
        middleware: 'Dashboard/generate/generate',
        message: `Error while completing the process`,
        payload: {
          details: error.message,
          stack: error.stack,
          data: {
            start,
            end,
          },
        },
      })

      throw error
    }
  }

  if (numDays > 5) {
    processGenerate()
    ctx.body = {
      message: 'We are processing your request, please validate in 15 minutes.',
    }
  } else {
    ctx.body = await processGenerate() // responseGenerateDashboard
  }

  ctx.status = 200
  ctx.set('Cache-Control', 'no-cache ')
  await next()
}
