import Handlebars from 'handlebars'
import Papa from 'papaparse'
import XLSX from 'xlsx'

const createXLSBuffer = (data: any, origin: string) => {
  if (origin === 'payoutReport') {
    const [columns, ...jsonData] = JSON.parse(data.jsonData);

    // Filtrar las columnas
    const filteredColumns = Object.entries(columns).reduce<{ [key: string]: any }>((acc, [key, value]) => {
      if (key !== 'timeZone' && key !== 'payId') {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Filtrar los datos de cada fila
    const dataRow = jsonData.map((obj: any) => {
      const { timeZone, payId, ...filteredObj } = obj;
      return {
        sellerId: data.seller.id,
        ...filteredObj,
      };
    });

    const columnNamesArray = Object.values(filteredColumns);
    const dataMatrix = [
      columnNamesArray,
      ...dataRow.map((obj: any) => Object.values(obj)),
    ];

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(dataMatrix);

    XLSX.utils.book_append_sheet(workbook, sheet, data.payoutReportFileName);

    return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' });
  }

  const { id, seller, invoiceCreatedDate } = data
  const jsonData = JSON.parse(data.jsonData)

  const invoiceData = Object.keys(jsonData).includes('jsonData')
    ? jsonData.jsonData
    : jsonData

  const sellerInformationColumn = [
    {
      ID: id,
      'Seller ID': seller.id,
      'Seller Name': seller.name,
      'SAP Seller ID': seller.sapSellerId,
      'Invoiced Created': invoiceCreatedDate,
      'SellerInvoiceID ': invoiceData.sellerInvoiceId,
    },
  ]

  const columnsData = invoiceData.orders
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
  const jsonData = JSON.parse(data.jsonData)

  const invoiceData = Object.keys(jsonData).includes('jsonData')
    ? jsonData.jsonData
    : jsonData

  const columnsData = invoiceData.orders
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

  const jsonData = JSON.parse(data.jsonData)

  const invoiceData = Object.keys(jsonData).includes('jsonData')
    ? jsonData.jsonData
    : jsonData

  // console.info({ id: data.id, jsonData: invoiceData })

  const response = await template.getTemplate()
  const hbTemplate = Handlebars.compile(response.Templates.email.Message)
  const htmlToPdf = hbTemplate({ ...data, jsonData: invoiceData })

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
