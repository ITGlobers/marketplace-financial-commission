const formatNumberToCustomString = (input: any) => {
  if (typeof input === 'number') {
    input = `${input}`
  }

  const amount = input.replace('.', ',')

  // const amountNumber = Number(amount)

  // const formattedNumber = amountNumber.toFixed(2)

  return amount
}

export default formatNumberToCustomString
