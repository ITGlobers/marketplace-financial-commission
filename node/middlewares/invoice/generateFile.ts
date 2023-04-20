import Papa from 'papaparse'
import XLSX from 'xlsx'

import { getInvoice } from './getInvoice'

function flattenObject(obj: any, prefix = ''): any {
  return Object.entries(obj).reduce((acc: any, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null) {
      return { ...acc, ...flattenObject(value, newKey) }
    }

    acc[newKey] = value

    return acc
  }, {})
}

const createXLSBuffer = (data: any[]) => {
  const flattenedData = data.map((item) => flattenObject(item))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(flattenedData)

  XLSX.utils.book_append_sheet(workbook, worksheet, 'invoice')

  return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' })
}

function generateCSV(data: any[]): string {
  const flattenedData = data.map((item) => flattenObject(item))

  return Papa.unparse(flattenedData)
}

type FileType = 'csv' | 'xls'

type GenerateFileFunction = (invoice: any) => string

type GenerateFileObject = {
  [key in FileType]: GenerateFileFunction
} & {
  default: () => never
}

const generateFile: GenerateFileObject = {
  csv: (invoice: any) => generateCSV([invoice]),
  xls: (invoice: any) => createXLSBuffer([invoice]),
  default: () => {
    throw new Error('Invalid file type')
  },
}

export async function generateFileByType(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    vtex: {
      route: {
        params: { type },
      },
    },
  } = ctx

  const invoice = await getInvoice(ctx)

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  console.info('invoice: ', invoice)
  const genarator =
    generateFile[type as keyof GenerateFileObject] || generateFile.default

  const file = genarator(invoice)

  ctx.status = 200
  ctx.set('Content-Type', `application/${type}`)
  ctx.set('Content-Disposition', `attachment; filename=${invoice?.id}.${type}`)
  ctx.body = file

  ctx.set('Cache-Control', 'no-cache')
  await next()
}
