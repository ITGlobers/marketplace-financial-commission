import { UserInputError } from '@vtex/api'
import { json } from 'co-body'

import { validateDateFormat } from '../validationParams'

/**
 * @description
 * Attempts to update an Invoice.
 * @returns
 * Message confirming the update
 */
export async function updateInvoice(ctx: Context): Promise<string> {
  const {
    clients: { commissionInvoices },
    vtex: {
      route: {
        params: { id },
      },
    },
    req,
  } = ctx

  const requestBody = await json(req)

  if (
    requestBody.invoiceCreatedDate &&
    !validateDateFormat(requestBody.invoiceCreatedDate)
  ) {
    throw new UserInputError(
      'Invalid invoiceCreatedDate format. The date format is yyyy-mm-dd.'
    )
  }

  const invoice = {
    id: id[0],
    ...requestBody,
  }

  await commissionInvoices.update(id.toString(), invoice)

  return `Invoice ${id.toString()} updated`
}
