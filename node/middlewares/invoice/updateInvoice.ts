import { UserInputError } from '@vtex/api'
import { json } from 'co-body'

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

  const isValidDate = (dateString: string) => {
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
    requestBody.invoiceCreatedDate &&
    !isValidDate(requestBody.invoiceCreatedDate)
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
