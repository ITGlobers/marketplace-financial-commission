import type { RouteHandler } from '@vtex/api'
import { method } from '@vtex/api'

import {
  authenticationValidationVtex,
  createInvoiceExternal,
  eligibleSellers,
  errorHandler,
  generateInvoices,
  getInvoiceExternal,
  invoicesBySeller,
  orders,
  policy,
  resolveInvoice,
  searchSellers,
  searchStatistics,
  sellers,
  sellersResponse,
  sendMail,
  templateMethod,
  payoutTemplateMethod,
  createPayoutReport,
  getInvoiceExternalFile,
  searchPayoutReport,
} from './middlewares'
import { authentication } from './middlewares/authentication/authentication'
import { authenticationMarketplace } from './middlewares/authentication/authenticationMarketplace'
import { createTokenAuth } from './middlewares/authentication/createTokenAuth'
import { getToken } from './middlewares/authentication/getToken'
import { switchUser } from './middlewares/authentication/switchUser'
import { updateToken } from './middlewares/authentication/updateToken'
import { generate } from './middlewares/dashboard/generate/generate'
import { deleteInvoiceExternal } from './middlewares/invoiceExternal/deleteInvoiceExternal'
import { updateInvoiceExternal } from './middlewares/invoiceExternal/updateInvoiceExternal'
import { validateParamsExternal } from './middlewares/invoiceExternal/validateParamsExternal'
import { seller } from './middlewares/sellers/seller'
import { getTypeIntegration } from './middlewares/typeIntegration/getTypeIntegration'
import { getPayoutReportFile } from './middlewares/payoutReport/getFile'
import { ping } from './middlewares/ping'
import { setSchemaVersion } from './middlewares/setSchema'
import type { Clients } from './clients'
import setApplicationSettings from './middlewares/setApplicationSettings'

const template = templateMethod

const baseMiddlewares = [errorHandler, setApplicationSettings, setSchemaVersion]

const routes: Record<string, RouteHandler<Clients, AppState>> = {
  mail: method({
    POST: [...baseMiddlewares, sendMail],
  }),
  _mail: method({
    POST: [...baseMiddlewares, sendMail],
  }),
  sellers: method({
    GET: [...baseMiddlewares, sellers, sellersResponse],
  }),
  template: method({
    GET: [...baseMiddlewares, template],
  }),
  payoutTemplate: method({
    GET: [...baseMiddlewares, payoutTemplateMethod],
  }),
  _template: method({
    GET: [...baseMiddlewares, template],
  }),
  generateDashboard: method({
    POST: [...baseMiddlewares, sellers, generate],
  }),
  searchSellersDashboard: method({
    GET: [...baseMiddlewares, searchSellers],
  }),
  searchStatisticsDashboard: method({
    GET: [...baseMiddlewares, searchStatistics],
  }),
  singleInvoice: method({
    GET: [...baseMiddlewares, seller, authentication, resolveInvoice],
    POST: [...baseMiddlewares, seller, authentication, resolveInvoice],
    DELETE: [...baseMiddlewares, seller, authentication, resolveInvoice],
    PATCH: [...baseMiddlewares, seller, authentication, resolveInvoice],
  }),
  _singleInvoice: method({
    GET: [...baseMiddlewares, seller, policy, resolveInvoice],
    POST: [...baseMiddlewares, seller, policy, resolveInvoice],
  }),
  invoicesBySeller: method({
    POST: [...baseMiddlewares, seller, invoicesBySeller],
  }),
  _invoicesBySeller: method({
    POST: [...baseMiddlewares, seller, policy, invoicesBySeller],
  }),
  generateInvoices: method({
    GET: [...baseMiddlewares, errorHandler, eligibleSellers, generateInvoices],
  }),
  orders: method({
    GET: [...baseMiddlewares, seller, authentication, orders],
  }),
  _orders: method({
    GET: [...baseMiddlewares, seller, policy, orders],
  }),
  token: method({
    POST: [
      ...baseMiddlewares,
      authenticationValidationVtex,
      switchUser,
      createTokenAuth,
    ],
    PUT: [
      ...baseMiddlewares,
      authenticationValidationVtex,
      switchUser,
      updateToken,
    ],
    GET: [
      ...baseMiddlewares,
      authenticationValidationVtex,
      switchUser,
      getToken,
    ],
  }),
  invoiceExternal: method({
    POST: [
      ...baseMiddlewares,
      authenticationMarketplace,
      validateParamsExternal,
      createInvoiceExternal,
    ],
    GET: [...baseMiddlewares, authenticationMarketplace, getInvoiceExternal],
    DELETE: [
      ...baseMiddlewares,
      authenticationMarketplace,
      validateParamsExternal,
      deleteInvoiceExternal,
    ],
    PATCH: [
      ...baseMiddlewares,
      authenticationMarketplace,
      validateParamsExternal,
      updateInvoiceExternal,
    ],
  }),
  invoiceExternalFile: method({
    GET: [...baseMiddlewares, getInvoiceExternalFile],
  }),
  _invoiceExternalFile: method({
    GET: [...baseMiddlewares, getInvoiceExternalFile],
  }),
  typeIntegration: method({
    GET: [...baseMiddlewares, getTypeIntegration],
  }),
  payoutReport: method({
    GET: [...baseMiddlewares, seller, searchPayoutReport],
    POST: [...baseMiddlewares, seller, createPayoutReport],
  }),
  _payoutReport: method({
    GET: [...baseMiddlewares, seller, searchPayoutReport],
    POST: [...baseMiddlewares, seller, createPayoutReport],
  }),
  payoutReportFile: method({
    GET: [...baseMiddlewares, getPayoutReportFile],
  }),
  _payoutReportFile: method({
    GET: [...baseMiddlewares, getPayoutReportFile],
  }),
  ping: method({
    POST: [ping],
  }),
}

export { routes }
