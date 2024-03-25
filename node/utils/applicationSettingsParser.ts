import { SEPARATOR_CHAR } from '../constants'
import type { ApplicationSettings } from '../typings/applicationSettings'

export type ApplicationSettingsParserParams = {
  userAgent: string
  settings?: Array<{ declarer: string } & Record<string, unknown>> | null
}

const applicationSettingsParser = ({
  settings,
  userAgent,
}: ApplicationSettingsParserParams): ApplicationSettings => {
  if (!settings || settings === null) {
    throw new Error('Applications settings not found')
  }

  const settingsFound = settings.find((setting) =>
    setting.declarer.includes(userAgent.split(SEPARATOR_CHAR)[0])
  )

  if (!settingsFound) throw new Error('Applications settings not found')

  return settingsFound[
    settingsFound.declarer.split(SEPARATOR_CHAR)[0]
  ] as ApplicationSettings
}

export default applicationSettingsParser
