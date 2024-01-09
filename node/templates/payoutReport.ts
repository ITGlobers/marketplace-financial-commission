import readFile from '../utils/readFile'

export const GetPayoutReportBody = async (_: Context) => {
  const MESSAGE_BODY = readFile('../assets/payoutReport.html')

  const invoiceDetailMessage = {
    Name: 'payout-report',
    FriendlyName: 'PayOut Report',
    IsDefaultTemplate: false,
    IsPersisted: true,
    IsRemoved: false,
    Type: '',
    Templates: {
      email: {
        To: '{{message.to}}',
        Subject: 'Payout Report',
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

export default GetPayoutReportBody
