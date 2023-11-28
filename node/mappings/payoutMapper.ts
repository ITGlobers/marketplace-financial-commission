export const payoutMapper = (data: any) => {
  const [columns, ...jsonData] = JSON.parse(
    data.jsonData.replace(/(\d)\.(\d)/g, '$1$2')
  )

  const filteredColumns = Object.entries(columns).reduce<{
    [key: string]: any
  }>((acc, [key, value]) => {
    if (key !== 'timeZone' && key !== 'payId') {
      acc[key] = value
    }

    return acc
  }, {})

  const dataRow = jsonData.map((obj: any) => {
    const { timeZone, payId, ...filteredObj } = obj

    return {
      sellerId: data.seller.id,
      ...filteredObj,
    }
  })

  const columnNamesArray = Object.values(filteredColumns)
  const dataMatrix = [
    columnNamesArray,
    ...dataRow.map((obj: any) => Object.values(obj)),
  ]

  return dataMatrix
}
