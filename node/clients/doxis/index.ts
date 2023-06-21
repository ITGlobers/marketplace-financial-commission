import FormData from 'form-data'
import { ExternalClient } from '@vtex/api'
import type { InstanceOptions, IOContext, RequestConfig } from '@vtex/api'

import { DoxisCredentials } from '../../environments'
import { statusToError } from '../../utils/errors'

export default class Doxis extends ExternalClient {
  private _dmsRepositoryId = ''
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://trx-proxy-vtex-doxis.stage-eks.dbs.obi.solutions', context, {
      ...(options ?? {}),
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  get dmsRepositoryId() {
    return this._dmsRepositoryId
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  set dmsRepositoryId(dmsRepositoryId: any) {
    this._dmsRepositoryId = dmsRepositoryId
  }

  private login = async () =>
    this.http.post(this.routes.login, {
      customerName: DoxisCredentials.CUSTOMER_NAME,
      userName: DoxisCredentials.USERNAME,
      password: DoxisCredentials.PASSWORS,
    })

  public createDocument = async (
    id: string,
    file: Buffer | string,
    type: string
  ) => {
    const data = new FormData()

    data.append('inputStream', file)
    data.append(
      'documentParams',
      JSON.stringify({
        mimeTypeName: `application/${type}}`,
        fullFileName: `${id}.${type}`,
        fileExtension: type,
        attributes: [
          {
            attributeDefinitionUUID: '10000002-0000-9000-3030-303131303635',
            values: ['0816'],
            attributeDataType: 'STRING',
          },
          {
            attributeDefinitionUUID: '8de2f3b9-e34d-4599-a4a9-5c982c69d107',
            values: [true],
            attributeDataType: 'BOOL',
          },
        ],
        documentTypeUUID: '68664dbb-bbf5-4cda-9b1c-d3e518cedecf',
      })
    )

    return this.post(this.routes.createDocument(), data, {
      headers: {
        ...data.getHeaders(),
      },
    })
  }

  public getDocument = async () => this.http.get(this.routes.getDocument())

  public logout = async () => this.http.post(this.routes.logout)

  protected get = async <T>(url: string, config?: RequestConfig) => {
    const jwtBearerAuth = await this.login()

    config = {
      ...config,
      headers: {
        ...(config?.headers ?? {}),
        Authorization: jwtBearerAuth,
      },
    }

    return this.http.get<T>(url, config).catch(statusToError)
  }

  protected post = async <T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ) => {
    const jwtBearerAuth = await this.login()

    config = {
      ...config,
      headers: {
        ...(config?.headers ?? {}),
        Authorization: jwtBearerAuth,
      },
    }

    return this.http.post<T>(url, data, config).catch(statusToError)
  }

  private get routes() {
    const base = '/restws/publicws/rest/api/v1'

    return {
      login: `${base}/login`,
      createDocument: () =>
        `${base}/dmsRepositories/${this.dmsRepositoryId}/documents`,
      getDocument: ({
        uuid,
        versionNr,
        representationId,
        contentObjectId,
      }: any = {}) =>
        `${base}/dmsRepositories/${this.dmsRepositoryId}/documents/${uuid}/versions/${versionNr}/representations/${representationId}/contentObjects/${contentObjectId}`,
      logout: `${base}/logout`,
    }
  }
}