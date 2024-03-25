import type { ExternalLogSeverity } from './externalLogMetadata'

export type MiddlewareLog = {
  severity: ExternalLogSeverity
  middleware: string
  message: string
  payload?: {
    details: unknown
    stack?: string
  } & Record<string, unknown>
}
