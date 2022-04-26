export const config = {
  BUCKET_VBASE: 'FinancialDSH',
  BUCKET_VBASE_TOKEN: 'TokenConfig',
  PRIVATE_KEY: 'daMud5nb5ZEHipscucqAGu5pPM224HUM',
  SETTINGS_BUCKET: 'settings',
  OUTSTANDING_BUCKET: 'outstanding',
} as const

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
} as const

export const JOB_STATUS = {
  ONGOING: 'ongoing',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const

export const INVOICE_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
} as const

export const PAGE_DEFAULT = 1
export const PAGE_SIZE_DEFAULT = 5
