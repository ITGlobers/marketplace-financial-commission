import { AuthenticationError, UserInputError } from '@vtex/api'
import { json } from 'co-body'

import { PAGE_DEFAULT, PAGE_SIZE_DEFAULT } from '../../constants'
import { typeIntegration } from '../../utils/typeIntegration'
import { validateDateFormat } from '../validationParams'

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

  if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
    throw new UserInputError(
      'Invalid startDate or endDate format. The date format is yyyy-mm-dd.'
    )
  }

  const where = `seller.id="${seller.id}" AND (invoiceCreatedDate between ${startDate} AND ${endDate})`

  const fields = [
    'id',
    'status',
    'seller',
    'invoiceCreatedDate',
    'totalizers',
    'files',
    'jsonData',
  ]

  let sellerInvoices

  const integration = await typeIntegration(ctx)

  if (TypeIntegration.external === integration) {
    sellerInvoices = await externalInvoices.searchRaw(
      { page, pageSize },
      fields,
      'createdIn DESC',
      where
    )
  } else {
    sellerInvoices = await commissionInvoices.searchRaw(
      { page, pageSize },
      fields,
      'createdIn DESC',
      where
    )
  }

  ctx.status = 200
  ctx.body = sellerInvoices
  ctx.set('Cache-Control', 'no-cache')

  await next()
}
