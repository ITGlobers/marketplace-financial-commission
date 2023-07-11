import { ExternalClient } from '@vtex/api'
import type { InstanceOptions, IOContext, RequestConfig } from '@vtex/api'

import { statusToError } from '../../utils/errors'

export default class PdfBuilder extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://2pff1ku37k.execute-api.us-east-1.amazonaws.com', context, {
      ...(options ?? {}),
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public generatePdf(htmlToPdf: string) {
    return this.post(
      this.routes.generatePdf(),
      JSON.stringify({ html: htmlToPdf }),
      {
        responseType: 'arraybuffer',
      }
    )
  }

  protected post = async <T>(
    url: string,
    data?: any,
    config?: RequestConfig
  ) => {
    config = {
      ...config,
      headers: {
        ...(config?.headers ?? {}),
      },
    }

    return this.http.post<T>(url, data, config).catch(statusToError)
  }

  private get routes() {
    const base = '/generate/pdf'

    return {
      generatePdf: () => `${base}`,
    }
  }
}
