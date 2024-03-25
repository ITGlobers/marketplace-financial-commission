import { json } from 'co-body'

import { ExternalLogSeverity } from '../../typings/externalLogMetadata'

function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(email)
}

export async function sendMail(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { mail },
    state: { logs },
  } = ctx

  const body = await json(ctx.req)

  const { email } = body

  if (!email) {
    ctx.status = 400
    ctx.body = 'Specify an email address'
    logs.push({
      message: String(ctx.body),
      middleware: 'Mail',
      severity: ExternalLogSeverity.ERROR,
    })

    return
  }

  if (!validateEmail(email)) {
    ctx.status = 400
    ctx.body = 'Invalid email address'
    logs.push({
      message: String(ctx.body),
      middleware: 'Mail',
      severity: ExternalLogSeverity.ERROR,
    })

    return
  }

  let data = {}

  if (!body.jsonData) {
    ctx.status = 400
    ctx.body = 'Specify a jsonData attribute for invoice payload'
    logs.push({
      message: String(ctx.body),
      middleware: 'Mail',
      severity: ExternalLogSeverity.ERROR,
    })

    return
  }

  data = { ...body.jsonData }

  const sendEmailResponse = await mail.sendMail({
    templateName: 'invoice-detail',
    jsonData: {
      message: {
        to: email,
      },
      ...data,
    },
  })

  if (sendEmailResponse) {
    ctx.status = 200
    ctx.body = 'ok'
  }

  await next()
}
