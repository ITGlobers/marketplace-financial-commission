import type { ClientsConfig } from '@vtex/api'
import type {
  SellersDashboard,
  StatisticsDashboard,
  CommissionInvoice,
  ExternalInvoice,
  PayoutReport,
} from 'obi.marketplace-financial-commission'
import { IOClients, LRUCache } from '@vtex/api'
import { masterDataFor } from '@vtex/clients'

import Mail from './mail'
import { OrdersClient } from './orders'
import SellersIO from './sellers'
import Template from './template'
import AppTokenClient from './vtexLogin'
import { Catalog } from './catalog'
import PdfBuilder from './pdf'
import Scheduler from './scheduler'
import Doxis from './doxis'

export class Clients extends IOClients {
  public get mail() {
    return this.getOrSet('mail', Mail)
  }

  public get sellersIO() {
    return this.getOrSet('sellersIO', SellersIO)
  }

  public get ordersClient() {
    return this.getOrSet('ordersClient', OrdersClient)
  }

  public get sellersDashboardClientMD() {
    return this.getOrSet(
      'sellersdashboards',
      masterDataFor<SellersDashboard>('sellersdashboards')
    )
  }

  public get statisticsDashboardClientMD() {
    return this.getOrSet(
      'statisticsdashboards',
      masterDataFor<StatisticsDashboard>('statisticsdashboards')
    )
  }

  public get template() {
    return this.getOrSet('template', Template)
  }

  public get commissionInvoices() {
    return this.getOrSet(
      'commissioninvoices',
      masterDataFor<CommissionInvoice>('commissioninvoices')
    )
  }

  public get externalInvoices() {
    return this.getOrSet(
      'externalinvoices',
      masterDataFor<ExternalInvoice>('externalinvoices')
    )
  }

  public get payoutReports() {
    return this.getOrSet(
      'payoutreports',
      masterDataFor<PayoutReport>('payoutreports')
    )
  }

  public get appTokenClient() {
    return this.getOrSet('appTokenClient', AppTokenClient)
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get doxis() {
    return this.getOrSet('doxis', Doxis)
  }

  public get pdf() {
    return this.getOrSet('pdf', PdfBuilder)
  }

  public get scheduler() {
    return this.getOrSet('scheduler', Scheduler)
  }
}

const TIMEOUT_MS = 60000
const memoryCache = new LRUCache<string, any>({ max: 5000 })
const TREE_SECONDS_MS = 3 * 1000
const CONCURRENCY = 10

metrics.trackCache('financial-commission', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
      memoryCache,
    },
    events: {
      exponentialTimeoutCoefficient: 2,
      exponentialBackoffCoefficient: 2,
      initialBackoffDelay: 50,
      retries: 1,
      timeout: TREE_SECONDS_MS,
      concurrency: CONCURRENCY,
    },
  },
}

export default clients
