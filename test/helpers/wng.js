const Wedding = require('../../build/Wedding')
const { gasLimit, addressZero } = require('../helpers/general')
const { Contract } = require('ethers')

const testStartWedding = async (
  context,
  partner1,
  partner2,
  name1,
  name2,
  weddingType
) => {
  const weddingAddress = await testStartWedding(
    context,
    partner1,
    partner2,
    name1,
    name2,
    weddingType
  )

  const wng = new Contract(weddingAddress.address, Wedding.abi, partner1)

  return {
    ...context,
    wng
  }
}

module.exports = {
  testStartWedding
}
