import Papa from 'papaparse'
import XLSX from 'xlsx'

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
  invoiceData: any,
  type: FileType
): Promise<string | Buffer> {
  if (!invoiceData) {
    throw new Error('Invoice not found')
  }

  const genarator =
    generateFile[type as keyof GenerateFileObject] || generateFile.default

  const file = genarator(invoiceData)

  return file
}
