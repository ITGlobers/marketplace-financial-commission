import Handlebars from 'handlebars'
import Papa from 'papaparse'
import XLSX from 'xlsx'

const createXLSBuffer = (data: any, origin: string) => {
  if (origin === 'payoutReport') {
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet(
      data.jsonData.map((column: any) => Object.values(column))
    )

    XLSX.utils.book_append_sheet(workbook, sheet, data.payoutReportFileName)

    return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' })
  }

  const workbook = XLSX.utils.book_new()
  const sellerInformation = XLSX.utils.json_to_sheet(data.sellerInformation)

  const orders = XLSX.utils.json_to_sheet(data.jsonData)

  XLSX.utils.book_append_sheet(
    workbook,
    sellerInformation,
    'Seller Informatiom'
  )
  XLSX.utils.book_append_sheet(workbook, orders, 'Orders')

  return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' })
}

function generateCSV(data: any): string {
  return `\uFEFF${Papa.unparse(data.jsonData)}`
}

async function generatePDF(data: any, ctx: Context): Promise<any> {
  const {
    clients: { template, pdf },
  } = ctx

  const jsonData = JSON.parse(data.original.jsonData)

  const response = await template.getTemplate()
  const hbTemplate = Handlebars.compile(response.Templates.email.Message)
  const htmlToPdf = hbTemplate({ ...data.original, jsonData })

  return pdf.generatePdf(htmlToPdf)
}

type FileType = 'csv' | 'xls' | 'pdf'

type GenerateFileFunction = (invoice: any, ctx: Context, origin: string) => any

type GenerateFileObject = {
  [key in FileType]: GenerateFileFunction
} & {
  default: () => never
}

const generateFile: GenerateFileObject = {
  csv: (invoice: any) => generateCSV(invoice),
  xls: (invoice: any, _, origin: string) => createXLSBuffer(invoice, origin),
  pdf: (invoice: any, ctx: Context) => generatePDF(invoice, ctx),
  default: () => {
    throw new Error('Invalid file type')
  },
}

export async function generateFileByType(
  invoiceData: any,
  type: FileType,
  ctx: Context,
  origin: string
): Promise<string | Buffer> {
  if (!invoiceData) {
    throw new Error('Invoice not found')
  }

  const genarator =
    generateFile[type as keyof GenerateFileObject] || generateFile.default

  const file = genarator(invoiceData, ctx, origin)

  return file
}
