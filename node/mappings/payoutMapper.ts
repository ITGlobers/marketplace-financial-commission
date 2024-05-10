export const payoutMapper = (data: any) =>
  data.map((column: any) => {
    const { timeZone, payId, ...newColumn } = column

    return Object.values(newColumn)
  })
