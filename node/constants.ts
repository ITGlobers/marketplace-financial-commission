export const config = {
  BUCKET_VBASE: 'FinancialDSH',
  BUCKET_VBASE_TOKEN: 'TC',
  PRIVATE_KEY: 'daMud5nb5ZEHipscucqAGu5pPM224HUM',
  SETTINGS_BUCKET: 'SETT',
  RETRY_SELLERS_BUCKET: 'retry',
  MANUAL_JOB_BUCKET: 'manual',
  AUTO_JOB_BUCKET: 'automatic',
  APIREST_JOB_BUCKET: 'api',
  INVOICE_MAIL_TEMPLATE: 'invoice-detail',
  INVOICE_MAIL_TEMPLATE_EXTERNAL: 'invoice-detail-external',
  INVOICE_EXTERNAL_BUCKET: 'invoice-ext',
} as const

export const TypeIntegration = {
  EXTERNAL: 'external',
  INTERNAL: 'internal',
}

export const validationMessage = {
  DEFAULT_ERRORMESSAGE_FIELD_IS_REQUIRED: 'This field is required',
  ERROR_MESSAGE_DATE_FORMAT:
    'Invalid date format. The date format is yyyy-mm-dd.',
  ERROR_MESSAGE_DATE_RANGE_MONTH_AND_YEAR: 'Range of year or month incorrect',
  ERROR_MESSAGE_DATE_RANGE_DAY: 'Day incorrect',
  ERROR_MESSAGE_DATE_BETWEEN_DAYS:
    'Only a date range of no more than 30 days is allowed.',
  ERROR_MESSAGE_DATE_END_EQUAL_OR_GREATER:
    'End date cannot be equal to or greater than the current current day or date..',
  ERROR_EMAIL: 'Please enter valid email',
  ERROR_JSONDATA: 'jsonData Invalid please check',
} as const

export const JOB_STATUS = {
  ONGOING: 'ONGOING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
  OMITTED: 'OMITTED',
} as const

export const INVOICE_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
} as const

export const PAGE_DEFAULT = 1
export const PAGE_SIZE_DEFAULT = 5

export const TYPES: Type[] = [
  {
    type: 'csv',
    mimeTypeName: 'text/plain',
    fileExtension: 'csv',
  },
  {
    type: 'xls',
    mimeTypeName:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileExtension: 'xlsx',
  },
  // {
  //   type: 'pdf',
  //   mimeTypeName: 'application/pdf',
  //   fileExtension: 'pdf',
  // },
]

export const SCHEMAS = {
  DEFAULT: '0.0.4',
  EXTERNAL_INVOICES: '0.0.4',
  PAYOUT_REPORTS: '0.0.4',
  COMMISSION_INVOICES: '0.0.4',
  SELLERS_DASHBOARD_CLIENT_MD: '0.0.4',
  STATISTICS_DASHBOARD_CLIENT_MD: '0.0.4',
}
