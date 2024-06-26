import { json } from 'co-body'

function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(email)
}

export async function sendMail(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { mail },
  } = ctx

  const body = await json(ctx.req)

  const { email } = body

  if (!email) {
    ctx.status = 400
    ctx.body = 'Specify an email address'

    return
  }

  if (!validateEmail(email)) {
    ctx.status = 400
    ctx.body = 'Invalid email address'

    return
  }

  let data = {}

  if (!body.jsonData) {
    ctx.status = 400
    ctx.body = 'Specify a jsonData attribute for invoice payload'

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
