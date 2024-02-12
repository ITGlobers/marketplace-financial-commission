export const invoiceMapper = (data: any) =>
  data.orders
    .map((order: any) => {
      const { orderId, paymentMethod, items } = order

      return items.map((item: any) => {
        const itemGrossPrice = parseFloat(item.itemGrossPrice).toFixed(2)

        return {
          // ...item,
          Pos: item.positionID,
          'Order ID': orderId,
          Zahlmethode: paymentMethod,
          Artikelnr: item.itemId,
          Artikelkategorie: item.articleCategory,
          Menge: item.itemQuantity,
          'Einzelpreis (brutto)': itemGrossPrice,
          'Umsatzbrutto pro Position': item.positionGrossPrice,
          'Gebühren in %': item.isShipping
            ? item.itemFreightCommissionRate
            : item.itemCommissionRate,
          'Gebühren in € inkl. MwSt': item.isShipping
            ? item.itemFreightCommissionAmount
            : item.itemCommissionAmount,
        }
      })
    })
    .flat()
