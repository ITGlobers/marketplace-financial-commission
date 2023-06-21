import { AuthenticationError, UserInputError } from '@vtex/api'
import { json } from 'co-body'

import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'
import { typeIntegration } from '../../utils/typeIntegration'

/**
 * @description Retrieves a REFERENCE list of invoices for a given seller.
 */
export async function invoicesBySeller(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { commissionInvoices, externalInvoices },
    state: {
      body: { seller },
    },
    vtex: {
      route: { params },
    },
    req,
  } = ctx

  /* This means the seller wants to access other seller's invoices */
  if (params.sellerId !== seller.id) {
    throw new AuthenticationError(
      `${seller.id} cannot access invoices for ${params.sellerId}`
    )
  }

  function isValidDate(dateString: string) {
    const regexDate = /^\d{4}-\d{2}-\d{2}$/

    if (!regexDate.test(dateString)) {
      return false
    }

    const [year, month, day] = dateString.split('-').map(Number)

    const date = new Date(year, month - 1, day)
    const isValid =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day

    return isValid
  }

  const {
    page = PAGE_DEFAULT,
    pageSize = PAGE_SIZE_DEFAULT,
    startDate,
    endDate,
  } = await json(req)

  if (!startDate || !endDate) {
    throw new UserInputError(
      'startDate and/or endDate not provided in the request'
    )
  }

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new UserInputError(
      'Invalid startDate or endDate format. The date format is yyyy-mm-dd.'
    )
  }

  const where = `seller.name="${seller.name}" AND (invoiceCreatedDate between ${startDate} AND ${endDate})`

  const fields = ['id', 'status', 'invoiceCreatedDate', 'totalizers']

  let sellerInvoices

  const integration = await typeIntegration(ctx)

  if (TypeIntegration.external === integration) {
    sellerInvoices = await externalInvoices.searchRaw(
      { page, pageSize },
      fields,
      'invoiceCreatedDate',
      where
    )
  } else {
    sellerInvoices = await commissionInvoices.searchRaw(
      { page, pageSize },
      fields,
      'invoiceCreatedDate',
      where
    )
  }

  ctx.status = 200
  ctx.body = sellerInvoices
  ctx.set('Cache-Control', 'no-cache ')

  await next()
}
