const formatNumberToCustomString = (input: any) => {
  const number = Number(input)

  const formattedNumber = number.toFixed(2)

  const finalFormat = formattedNumber.replace('.', ',')

  return finalFormat
}

export default formatNumberToCustomString
