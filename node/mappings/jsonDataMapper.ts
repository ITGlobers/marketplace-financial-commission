export const jsonDataMapper = (jsonString: any) => {
  let jsonObject = JSON.parse(jsonString);

  for (let order of jsonObject.orders) {
      for (let item of order.items) {
          item.itemGrossPrice = parseFloat(item.itemGrossPrice).toFixed(2);
      }
  }

  let jsonModifiedString = JSON.stringify(jsonObject);
  return(jsonModifiedString);
}
