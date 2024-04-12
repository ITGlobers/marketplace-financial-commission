import type { Clients } from '../clients'
import { config } from '../constants'
import readFile from '../utils/readFile'
import { typeIntegrationWithoutContext } from '../utils/typeIntegration'

export const GetBody = async (clients: Clients) => {
  const integration = await typeIntegrationWithoutContext(clients)

  const MESSAGE_BODY =
    integration === TypeIntegration.internal
      ? readFile('../assets/invoiceDetail.html')
      : readFile('../assets/invoiceDetailExternal.html')

  const invoiceDetailMessage = {
    Name: config.INVOICE_MAIL_TEMPLATE,
    FriendlyName: 'Invoice Detail',
    IsDefaultTemplate: false,
    IsPersisted: true,
    IsRemoved: false,
    Type: '',
    Templates: {
      email: {
        To: '{{message.to}}',
        Subject: 'Invoice Detail',
        Message: MESSAGE_BODY,
        Type: 'E',
        ProviderId: '00000000-0000-0000-0000-000000000000',
        IsActive: true,
        withError: false,
      },
      sms: {
        Type: 'S',
        IsActive: false,
        withError: false,
        Parameters: [],
      },
    },
  }

  return invoiceDetailMessage
}

export default GetBody
