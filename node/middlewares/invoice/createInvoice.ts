import { AuthenticationError, UserInputError } from '@vtex/api'
import { json } from 'co-body'

import { JOB_STATUS } from '../../constants'
import { invoicingProcess } from '../../services/invoicingProcess'

/**
 * @description Attempts to create an Invoice.
 */
export async function createInvoice(ctx: Context) {
  const {
    query: { sellerName },
    state: {
      body: { seller },
    },
    req,
  } = ctx

  /* This means the seller wants to access other seller's invoices */
  if (sellerName !== seller.name) {
    throw new AuthenticationError(`Cannot access invoices for ${seller}`)
  }

  const requestData = await json(req)

  if (!requestData.startDate || !requestData.endDate) {
    throw new UserInputError(
      'startDate and/or endDate not provided in the request'
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

  if (
    !isValidDate(requestData.startDate) ||
    !isValidDate(requestData.endDate)
  ) {
    throw new UserInputError(
      'Invalid startDate or endDate format. The date format is yyyy-mm-dd.'
    )
  }

  const sellerData = { ...requestData, id: seller.id, name: seller.name }

  const invoice = await invoicingProcess(ctx, sellerData)

  if (invoice === JOB_STATUS.OMITTED) {
    return 'No eligible orders to invoice for given date range'
  }

  return `Invoice ${invoice} created`
}
