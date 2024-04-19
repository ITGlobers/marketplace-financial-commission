const formatNumberToCustomString = (input: any) => {
  const amount = input.replace(',', '.')

  const amountNumber = Number(amount)

  const formattedNumber = amountNumber.toFixed(2)

  return formattedNumber
}

export default formatNumberToCustomString
