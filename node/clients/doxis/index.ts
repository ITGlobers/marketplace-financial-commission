import FormData from 'form-data'
import { ExternalClient } from '@vtex/api'
import type { InstanceOptions, IOContext, RequestConfig } from '@vtex/api'

import {
  DoxisCredentialsDev,
  DoxisCredentialsProd,
  DoxisCredentialsBase,
} from '../../environments'
import { statusToError } from '../../utils/errors'

export default class Doxis extends ExternalClient {
  private _dmsRepositoryId = ''
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      context.production
        ? DoxisCredentialsProd.URL_BASE
        : DoxisCredentialsDev.URL_BASE,
      context,
      {
        ...(options ?? {}),
        headers: {
          ...(options?.headers ?? {}),
          'Content-Type': 'application/json',
          'X-Vtex-Use-Https': 'true',
        },
      }
    )
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  get dmsRepositoryId() {
    return this._dmsRepositoryId
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  set dmsRepositoryId(dmsRepositoryId: any) {
    this._dmsRepositoryId = dmsRepositoryId
  }

  private login = async () => {
    const isProduction = this.context.production

    const credentials = isProduction
      ? DoxisCredentialsProd
      : DoxisCredentialsDev

    let password
    let userName

    if (this.dmsRepositoryId === 'COMMISSION_REPORT') {
      password = credentials.PASSWORS_COMMISSION_REPORT
      userName = credentials.USERNAME_COMMISSION_REPORT
    } else {
      password = credentials.PASSWORS_PAYOUT_REPORT
      userName = credentials.USERNAME_PAYOUT_REPORT
    }

    return this.http.post(this.routes.login, {
      customerName: credentials.CUSTOMER_NAME,
      userName,
      password,
    })
  }

  public createDocument = async (
    id: string,
    file: Buffer | string,
    { mimeTypeName, type, fileExtension, attributes = [] }: Type
  ) => {
    const data = new FormData()

    const documentTypeUUID =
      this.dmsRepositoryId === 'COMMISSION_REPORT'
        ? DoxisCredentialsBase.DOCUMENT_TYPE_UUID_COMMISSION_REPORT
        : DoxisCredentialsBase.DOCUMENT_TYPE_UUID_PAYOUT_REPORT

    data.append('inputStream', file)
    data.append(
      'documentParams',
      JSON.stringify({
        mimeTypeName,
        fullFileName: `${id}.${type}`,
        fileExtension,
        attributes,
        documentTypeUUID,
      })
    )

    return this.post(this.routes.createDocument(), data, {
      headers: {
        ...data.getHeaders(),
      },
    })
  }

  public getDocument = async ({
    uuid,
    versionNr,
    representationId,
    contentObjectId,
  }: any) =>
    this.get(
      this.routes.getDocument({
        uuid,
        versionNr,
        representationId,
        contentObjectId,
      }),
      {
        responseType: 'arraybuffer',
      }
    )

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
      }: any) =>
        `${base}/dmsRepositories/${this.dmsRepositoryId}/documents/${uuid}/versions/${versionNr}/representations/${representationId}/contentObjects/${contentObjectId}`,
      logout: `${base}/logout`,
    }
  }
}
