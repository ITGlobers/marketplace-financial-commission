export type ExternalLogMetadata = {
  account: string
  workspace: string
  middleware: string
  text: string
  additionalInfo?: {
    details: unknown
    stack?: string
  } & Record<string, unknown>
  severity: ExternalLogSeverity
}

// eslint-disable-next-line no-restricted-syntax
export enum ExternalLogSeverity {
  DEBUG = 1,
  INFO = 3,
  WARN = 4,
  ERROR = 5,
}
