import { SEPARATOR_CHAR } from '../constants'
import type { ApplicationSettings } from '../typings/applicationSettings'

export type ApplicationSettingsParserParams = Array<
  { declarer: string } & Record<string, unknown>
> | null

const applicationSettingsParser = (
  settings: ApplicationSettingsParserParams
): ApplicationSettings => {
  if (!settings || settings === null) {
    throw new Error('Applications settings not found')
  }

  let settingsFound: ApplicationSettings | undefined

  settings.forEach((setting) => {
    const settingsToEval = setting[setting.declarer.split(SEPARATOR_CHAR)[0]]

    if (isApplicationSettings(settingsToEval)) settingsFound = settingsToEval
  })

  if (!settingsFound) throw new Error('Applications settings not found')

  return settingsFound
}

const isApplicationSettings = (obj: unknown): obj is ApplicationSettings => {
  return (
    obj !== undefined &&
    typeof obj === 'object' &&
    obj !== null &&
    'loggerSettings' in obj
  )
}

export default applicationSettingsParser
