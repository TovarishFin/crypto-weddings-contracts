const Wedding = require('../../build/Wedding')
const { gasLimit } = require('../helpers/general')
const { testStartWedding: testNewWedding } = require('../helpers/wmr')
const { Contract } = require('ethers')
const chalk = require('chalk')

const testStartWedding = async (
  context,
  partner1,
  partner2,
  name1,
  name2,
  weddingType
) => {
  const { address: p1Address } = partner1
  const { address: p2Address } = partner2
  const weddingAddress = await testNewWedding(
    context,
    partner1,
    partner2,
    name1,
    name2,
    weddingType
  )
  const wng = new Contract(weddingAddress, Wedding.abi, partner1)

  const postPartner1 = await wng.partner1()
  const postP1Name = await wng.p1Name()
  const postPartner2 = await wng.partner2()
  const postP2Name = await wng.p2Name()
  const postWeddingType = await wng.weddingType()
  const postStage = await wng.stage()

  expect(postPartner1).to.eq(p1Address, 'postPartner1 should match p1Address')
  expect(postP1Name).to.eq(name1, 'postP1Name should match name1')
  expect(postPartner2).to.eq(p2Address, 'postPartner2 should match p2Address')
  expect(postP2Name).to.eq(name2, 'postP2Name should match named2')
  expect(postWeddingType).to.eq(
    weddingType,
    'postWeddingType should match weddingType'
  )
  expect(postStage).to.eq(1, 'postStage should be 1, Initialized')

  return {
    ...context,
    wng
  }
}

const checkIsPartner = async (context, wallet) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)

  const partner1 = await wng.partner1()
  const partner2 = await wng.partner2()
  let isPartner1, isPartner2

  if (wallet.address === partner1) {
    isPartner1 = true
  }

  if (wallet.address === partner2) {
    isPartner2 = true
  }

  if (!isPartner1 && !isPartner2) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.yellow('warning: supplied address is neither partner1 nor partner2')
    )
  }

  return {
    isPartner1,
    isPartner2
  }
}

const testUpdateVows = async (context, wallet, vows) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)
  const { isPartner1, isPartner2 } = await checkIsPartner(context, wallet)

  await wng.updateVows(vows, { gasLimit })

  if (isPartner1) {
    const postP1Vows = await wng.p1Vows()
    expect(postP1Vows).to.eq(vows, 'postP1Vows should match vows')
  } else if (isPartner2) {
    const postP2Vows = await wng.p2Vows()
    expect(postP2Vows).to.eq(vows, 'postP2Vows should match vows')
  } else {
    expect.fail('updateVows should not allow non-fiance to updateVows')
  }
}

module.exports = {
  testStartWedding,
  testUpdateVows
}
