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

const template = templateMethod

const routes = {
  mail: method({
    POST: [setSchemaVersion, sendMail],
  }),
  _mail: method({
    POST: [setSchemaVersion, sendMail],
  }),
  sellers: method({
    GET: [setSchemaVersion, sellers, sellersResponse],
  }),
  template: method({
    GET: [setSchemaVersion, template],
  }),
  payoutTemplate: method({
    GET: [setSchemaVersion, payoutTemplateMethod],
  }),
  _template: method({
    GET: [setSchemaVersion, template],
  }),
  generateDashboard: method({
    POST: [setSchemaVersion, sellers, generate],
  }),
  searchSellersDashboard: method({
    GET: [setSchemaVersion, searchSellers],
  }),
  searchStatisticsDashboard: method({
    GET: [setSchemaVersion, searchStatistics],
  }),
  singleInvoice: method({
    GET: [setSchemaVersion, seller, authentication, resolveInvoice],
    POST: [setSchemaVersion, seller, authentication, resolveInvoice],
    DELETE: [setSchemaVersion, seller, authentication, resolveInvoice],
    PATCH: [setSchemaVersion, seller, authentication, resolveInvoice],
  }),
  _singleInvoice: method({
    GET: [setSchemaVersion, seller, policy, resolveInvoice],
    POST: [setSchemaVersion, seller, policy, resolveInvoice],
  }),
  invoicesBySeller: method({
    POST: [setSchemaVersion, seller, invoicesBySeller],
  }),
  _invoicesBySeller: method({
    POST: [setSchemaVersion, seller, policy, invoicesBySeller],
  }),
  generateInvoices: method({
    GET: [setSchemaVersion, errorHandler, eligibleSellers, generateInvoices],
  }),
  orders: method({
    GET: [setSchemaVersion, seller, authentication, orders],
  }),
  _orders: method({
    GET: [setSchemaVersion, seller, policy, orders],
  }),
  token: method({
    POST: [
      setSchemaVersion,
      authenticationValidationVtex,
      switchUser,
      createTokenAuth,
    ],
    PUT: [
      setSchemaVersion,
      authenticationValidationVtex,
      switchUser,
      updateToken,
    ],
    GET: [setSchemaVersion, authenticationValidationVtex, switchUser, getToken],
  }),
  invoiceExternal: method({
    POST: [
      setSchemaVersion,
      authenticationMarketplace,
      validateParamsExternal,
      createInvoiceExternal,
    ],
    GET: [setSchemaVersion, authenticationMarketplace, getInvoiceExternal],
    DELETE: [
      setSchemaVersion,
      authenticationMarketplace,
      validateParamsExternal,
      deleteInvoiceExternal,
    ],
    PATCH: [
      setSchemaVersion,
      authenticationMarketplace,
      validateParamsExternal,
      updateInvoiceExternal,
    ],
  }),
  invoiceExternalFile: method({
    GET: [setSchemaVersion, getInvoiceExternalFile],
  }),
  _invoiceExternalFile: method({
    GET: [setSchemaVersion, getInvoiceExternalFile],
  }),
  typeIntegration: method({
    GET: [setSchemaVersion, getTypeIntegration],
  }),
  payoutReport: method({
    GET: [setSchemaVersion, seller, searchPayoutReport],
    POST: [setSchemaVersion, seller, createPayoutReport],
  }),
  _payoutReport: method({
    GET: [setSchemaVersion, seller, searchPayoutReport],
    POST: [setSchemaVersion, seller, createPayoutReport],
  }),
  payoutReportFile: method({
    GET: [setSchemaVersion, getPayoutReportFile],
  }),
  _payoutReportFile: method({
    GET: [setSchemaVersion, getPayoutReportFile],
  }),
  ping: method({
    POST: [setSchemaVersion, ping],
  }),
}

export { routes }
