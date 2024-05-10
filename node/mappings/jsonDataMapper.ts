import formatNumberToCustomString from '../utils/formatNumberToCustomString'

export const jsonDataMapper = (jsonString: any) => {
  const jsonObject = JSON.parse(jsonString)

  for (const order of jsonObject.orders) {
    for (const item of order.items) {
      item.itemGrossPrice = formatNumberToCustomString(item.itemGrossPrice)
      item.positionGrossPrice = formatNumberToCustomString(
        item.positionGrossPrice
      )
      item.itemFreightCommissionPercentage = formatNumberToCustomString(
        item.itemFreightCommissionPercentage
      )
      item.itemCommissionPercentage = formatNumberToCustomString(
        item.itemCommissionPercentage
      )
      item.itemFreightCommissionAmount = formatNumberToCustomString(
        item.itemFreightCommissionAmount
      )
      item.itemCommissionAmount = formatNumberToCustomString(
        item.itemCommissionAmount
      )
    }
  }

  const jsonModifiedString = JSON.stringify(jsonObject)

  return jsonModifiedString
}
