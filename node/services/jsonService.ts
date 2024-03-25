import type { DocumentResponse } from '@vtex/clients'
import FormData from 'form-data'

export const jsonStorageService = (ctx: Context, entityName: string) => ({
  save: async (data: any) => {
    const {
      clients: { masterdataV1 },
    } = ctx

    const { id, jsonData } = data

    const { DocumentId } = (await masterdataV1.createDocument(entityName, {
      id,
    })) as DocumentResponse

    const jsonDataToSave = JSON.stringify(jsonData, null, 2)

    const formData = new FormData()

    formData.append('jsonFile', jsonDataToSave, `${DocumentId}.json`)

    await masterdataV1.uploadAttachment(
      entityName,
      DocumentId,
      `file`,
      formData
    )

    return true
  },
  get: async (id: any) => {
    const {
      clients: { masterdataV1 },
    } = ctx

    const jsonFile = await masterdataV1.downloadAttachment(
      entityName,
      id,
      'file'
    )

    return JSON.parse(jsonFile)
  },
})
