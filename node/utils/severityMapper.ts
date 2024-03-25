import { LogLevel } from '@vtex/api'

import { ExternalLogSeverity } from '../typings/externalLogMetadata'

export const severityMapper = (severity: ExternalLogSeverity): LogLevel => {
  const map: Record<ExternalLogSeverity, LogLevel> = {
    [ExternalLogSeverity.DEBUG]: LogLevel.Debug,
    [ExternalLogSeverity.INFO]: LogLevel.Info,
    [ExternalLogSeverity.WARN]: LogLevel.Warn,
    [ExternalLogSeverity.ERROR]: LogLevel.Error,
  }

  return map[severity]
}
