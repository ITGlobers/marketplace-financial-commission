export const invoiceMapper = (data: any) =>
  data.orders
    .map((order: any) => {
      const { orderId, paymentMethod, items } = order

      return items.map((item: any) => {
        return {
          // ...item,
          Pos: item.positionID,
          'Order ID': orderId,
          Zahlmethode: paymentMethod,
          Artikelnr: item.itemId,
          Artikelkategorie: item.articleCategory,
          Menge: item.itemQuantity,
          'Einzelpreis (brutto)': item.itemGrossPrice,
          'Umsatzbrutto pro Position': item.positionGrossPrice,
          'Gebühren in %': item.itemCommissionPercentage,
          'Gebühren in €': item.isShipping
            ? item.itemFreightCommissionAmount
            : item.itemCommissionAmount,
        }
      })
    })
    .flat()
