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
  listPayoutReport,
  createPayoutReport,
} from './middlewares'
import { authentication } from './middlewares/authentication/authentication'
import { authenticationMarketplace } from './middlewares/authentication/authenticationMarketplace'
import { createTokenAuth } from './middlewares/authentication/createTokenAuth'
import { getToken } from './middlewares/authentication/getToken'
import { switchUser } from './middlewares/authentication/switchUser'
import { updateToken } from './middlewares/authentication/updateToken'
import { generate } from './middlewares/dashboard/generate/generate'
import { generateFileByType } from './middlewares/invoice/generateFile'
import { deleteInvoiceExternal } from './middlewares/invoiceExternal/deleteInvoiceExternal'
import { updateInvoiceExternal } from './middlewares/invoiceExternal/updateInvoiceExternal'
import { validateParamsExternal } from './middlewares/invoiceExternal/validateParamsExternal'
import { seller } from './middlewares/sellers/seller'
import { getTypeIntegration } from './middlewares/typeIntegration/getTypeIntegration'

const template = templateMethod

const routes = {
  mail: method({
    POST: [sendMail],
  }),
  _mail: method({
    POST: [sendMail],
  }),
  sellers: method({
    GET: [sellers, sellersResponse],
  }),
  template: method({
    GET: [template],
  }),
  _template: method({
    GET: [template],
  }),
  generateDashboard: method({
    POST: [sellers, generate],
  }),
  searchSellersDashboard: method({
    GET: [searchSellers],
  }),
  searchStatisticsDashboard: method({
    GET: [searchStatistics],
  }),
  singleInvoice: method({
    GET: [seller, authentication, resolveInvoice],
    POST: [seller, authentication, resolveInvoice],
    DELETE: [seller, authentication, resolveInvoice],
    PATCH: [seller, authentication, resolveInvoice],
  }),
  _singleInvoice: method({
    GET: [seller, policy, resolveInvoice],
    POST: [seller, policy, resolveInvoice],
  }),
  invoicesBySeller: method({
    POST: [seller, authentication, invoicesBySeller],
  }),
  _invoicesBySeller: method({
    POST: [seller, policy, invoicesBySeller],
  }),
  generateInvoices: method({
    GET: [errorHandler, eligibleSellers, generateInvoices],
  }),
  orders: method({
    GET: [seller, authentication, orders],
  }),
  _orders: method({
    GET: [seller, policy, orders],
  }),
  token: method({
    POST: [authenticationValidationVtex, switchUser, createTokenAuth],
    PUT: [authenticationValidationVtex, switchUser, updateToken],
    GET: [authenticationValidationVtex, switchUser, getToken],
  }),
  invoiceExternal: method({
    POST: [
      authenticationMarketplace,
      validateParamsExternal,
      createInvoiceExternal,
    ],
    GET: [authenticationMarketplace, getInvoiceExternal],
    DELETE: [
      authenticationMarketplace,
      validateParamsExternal,
      deleteInvoiceExternal,
    ],
    PATCH: [
      authenticationMarketplace,
      validateParamsExternal,
      updateInvoiceExternal,
    ],
  }),
  invoiceExternalFile: method({
    GET: [authenticationMarketplace, getInvoiceExternalFile],
  }),
  typeIntegration: method({
    GET: [getTypeIntegration],
  }),
  payoutReport: method({
    GET: [seller, searchPayoutReport],
    POST: [seller, createPayoutReport],
  }),
}

export { routes }
