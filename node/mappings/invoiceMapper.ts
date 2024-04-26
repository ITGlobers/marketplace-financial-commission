import formatNumberToCustomString from '../utils/formatNumberToCustomString'

export const invoiceMapper = (data: any) =>
  data.orders
    .map((order: any) => {
      const { orderId, paymentMethod, items, reference } = order

      return items.map((item: any) => {
        return {
          // ...item,
          Pos: items.positionID,
          'Order ID': orderId,
          Zahlmethode: paymentMethod,
          Artikelnr: item.itemId,
          Artikelkategorie: item.isShipping
            ? 'Versandkosten'
            : item.itemCategoryId,
          Menge: item.itemQuantity,
          'Einzelpreis (brutto)': formatNumberToCustomString(
            item.itemGrossPrice
          ),
          'Umsatzbrutto pro Position': formatNumberToCustomString(
            item.positionGrossPrice
          ),
          'Geühren  in % inkl. MwSt': item.isShipping
            ? formatNumberToCustomString(item.itemFreightCommissionPercentage)
            : formatNumberToCustomString(item.itemCommissionPercentage),
          'Geühren in € inkl. MwSt': item.isShipping
            ? formatNumberToCustomString(item.itemFreightCommissionAmount)
            : formatNumberToCustomString(item.itemCommissionAmount),
          Referenz: reference,
        }
      })
    })
    .flat()
