import Handlebars from 'handlebars'
import Papa from 'papaparse'
import XLSX from 'xlsx'

const createXLSBuffer = (data: any, origin: string) => {
  if (origin === 'payoutReport') {
    const jsonData = JSON.parse(data.jsonData)
    const [columns] = jsonData

    jsonData.shift()

    const dataRow = jsonData.map((obj: any) => ({
      ...obj,
      sellerId: data.seller.id,
    }))

    const columnNamesArray = Object.values(columns)
    const dataMatrix = [
      columnNamesArray,
      ...dataRow.map((obj: any) => Object.values(obj)),
    ]

    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet(dataMatrix)

    XLSX.utils.book_append_sheet(workbook, sheet, data.payoutReportFileName)

    return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' })
  }

  const { id, seller, invoiceCreatedDate } = data
  const { jsonData } = JSON.parse(data.jsonData)

  const sellerInformationColumn = [
    {
      ID: id,
      'Seller ID': seller.id,
      'Seller Name': seller.name,
      'SAP Seller ID': seller.sapSellerId,
      'Invoiced Created': invoiceCreatedDate,
      'SellerInvoiceID ': jsonData.sellerInvoiceId,
    },
  ]

  const columnsData = jsonData.orders
    .map((order: any) => {
      const { positionID, orderId, paymentMethod, items } = order

      return items.map((item: any) => {
        return {
          // ...item,
          Pos: positionID,
          'Order ID': orderId,
          Zahlmethode: paymentMethod,
          Artikelnr: item.itemId,
          Artikelkategorie: item.articleCategory,
          Menge: item.itemQuantity,
          'Einzelpreis (brutto)': item.itemGrossPrice,
          'Umsatzbrutto pro Position': item.positionGrossPrice,
          'Gebühren in %': item.itemCommissionPercentage,
          'Gebühren in €': item.itemCommissionAmount,
        }
      })
    })
    .flat()

  const workbook = XLSX.utils.book_new()
  const sellerInformation = XLSX.utils.json_to_sheet(sellerInformationColumn)
  const orders = XLSX.utils.json_to_sheet(columnsData)

  XLSX.utils.book_append_sheet(
    workbook,
    sellerInformation,
    'Seller Informatiom'
  )
  XLSX.utils.book_append_sheet(workbook, orders, 'Orders')

  return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' })
}

// TO DO: refactor this function
function generateCSV(data: any): string {
  const { jsonData } = JSON.parse(data.jsonData)

  const columnsData = jsonData.orders
    .map((order: any) => {
      const { positionID, orderId, paymentMethod, items } = order

      return items.map((item: any) => {
        return {
          // ...item,
          Pos: positionID,
          'Order ID': orderId,
          Zahlmethode: paymentMethod,
          Artikelnr: item.itemId,
          Artikelkategorie: item.articleCategory,
          Menge: item.itemQuantity,
          'Einzelpreis (brutto)': item.itemGrossPrice,
          'Umsatzbrutto pro Position': item.positionGrossPrice,
          'Gebühren in %': item.itemCommissionPercentage,
          'Gebühren in €': item.itemCommissionAmount,
        }
      })
    })
    .flat()

  return Papa.unparse(columnsData)
}

async function generatePDF(data: any, ctx: Context): Promise<any> {
  const {
    clients: { template, pdf },
  } = ctx

  const response = await template.getTemplate()
  const hbTemplate = Handlebars.compile(response.Templates.email.Message)
  const htmlToPdf = hbTemplate({ id: data.id, ...JSON.parse(data.jsonData) })

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
