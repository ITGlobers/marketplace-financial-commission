export interface PayoutReport {
  sellerId: string
  paymentMethod: string
  creationDate: string
  timeZone: string
  transactionType: string
  grossCurrency: string
  grossDebit: number | null
  grossCredit: number | null
  exchangeRate: number
  netCurrency: string
  netDebit: number | null
  netCredit: number | null
  commissionAmount: number
  orderId: string
  payId: string
  invoiceId: string
  chargebackType: string | null
  reserved1: any
  reserved2: any
}
