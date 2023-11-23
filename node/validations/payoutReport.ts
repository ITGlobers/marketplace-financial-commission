import Joi from 'joi'

const schemaJSONData = Joi.object({
  sellerId: Joi.string().required(),
  paymentMethod: Joi.string().valid('Internal Transfer', 'Klarna', 'CC', 'PayPal').required(),
  creationDate: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .message('Format date invalid. "yyyy-mm-dd"')
    .required(),
  timeZone: Joi.string().allow(''),
  transactionType: Joi.string()
    .valid('settled', 'refunded', 'chargeback', 'adjustment')
    .required(),
  grossCurrency: Joi.string()
    .length(3)
    .uppercase()
    .regex(/^[A-Z]{3}$/)
    .required(),
  grossDebit: Joi.number().required(),
  grossCredit: Joi.number().valid(null),
  exchangeRate: Joi.number().min(0).required(),
  netCurrency: Joi.string()
    .length(3)
    .uppercase()
    .regex(/^[A-Z]{3}$/)
    .required(),
  netDebit: Joi.number().required(),
  netCredit: Joi.number().valid(null),
  commissionAmount: Joi.number().required(),
  orderId: Joi.string(),
  payId: Joi.string(),
  invoiceId: Joi.string().allow(''),
  chargebackType: Joi.string()
    .valid('Retention', 'Resolution retention', null)
    .required(),
  reserved1: Joi.string().valid(null),
  reserved2: Joi.string().valid(null),
})

const schemaJSONDataArray = Joi.array().items(schemaJSONData)

const schemaSeller = Joi.object({
  sellerId: Joi.string().required(),
  sellerName: Joi.string().required(),
})

const schemaPayoutReport = Joi.object({
  reportCreatedDate: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .message('Format date invalid. "yyyy-mm-dd"')
    .required(),
  seller: schemaSeller,
  payoutReportFileName: Joi.string().required(),
  jsonData: schemaJSONDataArray,
})

export default schemaPayoutReport
