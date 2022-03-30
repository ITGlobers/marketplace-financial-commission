import type { ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'

declare global {
  type Context = ServiceContext<Clients>

  type LoggerMessage = {
    workflowInstance: string
    message: string
    exception?: string
    request?: any
  }

  interface DatesInvoice {
    dateInvoiceInitial: string
    dateInvoiceEnd: string
    formattedDate: string
  }

  interface Item {
    id: string
    name: string
    account: string
    productCommissionPercentage: float
    freightCommissionPercentage: float
    isActive: boolean
  }

  interface Paging {
    total: number
  }

  interface Sellers {
    items: Item[]
    paging: Paging
  }

  interface Data {
    sellers: Sellers
  }

  interface DataSellers {
    data: Data
  }

  interface ParamsListOrders {
    fStatus: string
    fieldDate: string
    fieldDateStart: string
    fieldDateEnd: string
    sellerName: string
    orderBy: string
    page: number
  }
}

export {}