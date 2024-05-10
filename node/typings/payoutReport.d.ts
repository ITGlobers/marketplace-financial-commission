interface Transaction {
  paymentMethod: string
  creationDate: string
  timeZone: string
  transactionType: string
  grossCurrency: string
  grossDebit?: number
  grossCredit?: null | number
  exchangeRate: number
  netCurrency: string
  netDebit: number
  netCredit?: null | number
  commissionAmount: number
  orderId: string
  payId: string
  invoiceId: string
  chargebackType?: null | string
  reserved1?: null | string
  reserved2?: null | string
}

export interface PayoutReport {
  id?: string
  reportCreatedDate: Date
  seller: {
    name: string
    id: string
  }
  payoutReportFileName: string
  jsonData: string | Transaction[]
}
