export type ExternalLogMetadata = {
  account: string
  workspace: string
  middleware: string
  text: string
  stack?: unknown
  additionalInfo?: unknown
  severity: ExternalLogSeverity
}

// eslint-disable-next-line no-restricted-syntax
export enum ExternalLogSeverity {
  DEBUG = 1,
  INFO = 3,
  WARN = 4,
  ERROR = 5,
}
