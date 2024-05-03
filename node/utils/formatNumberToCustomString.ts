const formatNumberToCustomString = (input: any) => {
  if (typeof input === 'number') {
    input = `${input.toFixed(2)}`
  }

  const amount = input.replace('.', ',')

  // const amountNumber = Number(amount)

  // const formattedNumber = amountNumber.toFixed(2)

  return amount
}

export default formatNumberToCustomString
