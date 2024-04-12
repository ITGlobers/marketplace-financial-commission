export const jsonDataMapper = (jsonString: string) => {
  const jsonObject = JSON.parse(jsonString)

  for (const order of jsonObject.orders) {
    for (const item of order.items) {
      item.itemGrossPrice = parseFloat(item.itemGrossPrice).toFixed(2)
    }
  }

  const jsonModifiedString = JSON.stringify(jsonObject)

  return jsonModifiedString
}
