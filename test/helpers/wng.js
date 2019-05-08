const Wedding = require('../../build/Wedding')
const { gasLimit, waitForEvent } = require('../helpers/general')
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
      // TODO: double check if we really want to keep this here...
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

const testAcceptProposal = async (context, wallet) => {
  const { wng: unconnected, provider } = context
  const wng = unconnected.connect(wallet)
  const { isPartner1, isPartner2 } = await checkIsPartner(context, wallet)

  const tx = await wng.acceptProposal({ gasLimit })
  const { transactionHash } = await tx.wait()
  const { blockNumber } = await provider.getTransaction(transactionHash)
  const { timestamp } = await provider.getBlock(blockNumber)

  const postP1Answer = await wng.p1Answer()
  const postP2Answer = await wng.p2Answer()
  const postStage = await wng.stage()
  const postMarried = await wng.married()
  const postDateMarried = await wng.dateMarried()

  if (isPartner1) {
    expect(postP1Answer).to.eq(true, 'postP1Answer should be true')
  } else if (isPartner2) {
    expect(postP2Answer).to.eq(true, 'postP2Answer should be true')
  } else {
    expect.fail('acceptProposal should NOT allow non-fiance to acceptProposal')
  }

  if (postP1Answer && postP2Answer) {
    expect(postStage).to.eq(3, 'postStage should match 3, Married')
    expect(postMarried).to.eq(true, 'postMarried should be true')
    expect(postDateMarried).to.eq(
      timestamp,
      'postDateMarried should match tx timestmap'
    )
  } else {
    expect(postStage).to.eq(2, 'postStage should match 2, InProgress')
    expect(postMarried).to.eq(false, 'postMarried should be false')
  }
}

const testUpdateWeddingPhoto = async (context, wallet, uri) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)

  const preWeddingPhoto = await wng.weddingPhoto()

  await wng.updateWeddingPhoto(uri, { gasLimit })

  const postWeddingPhoto = await wng.weddingPhoto()

  expect(preWeddingPhoto).to.not.eq(
    postWeddingPhoto,
    'post and pre weddingPhotos should NOT match'
  )

  expect(postWeddingPhoto).to.eq(uri, 'postWeddingPhoto should match uri')
}

const testSendWeddingGiftFallback = async (context, wallet, value) => {
  const { wng, wmr, provider } = context

  const preWeddingBalance = await provider.getBalance(wng.address)
  const preSenderBalance = await provider.getBalance(wallet.address)

  const giftEvent = waitForEvent(wmr, 'GiftReceived', 5000)
  const { wait, gasPrice } = await wallet.sendTransaction({
    to: wng.address,
    value,
    gasLimit
  })
  const { gasUsed } = await wait()
  const gasCost = gasUsed.mul(gasPrice)
  const {
    args: { wedding, gifter, value: eventValue, message }
  } = await giftEvent

  const postWeddingBalance = await provider.getBalance(wng.address)
  const postSenderBalance = await provider.getBalance(wallet.address)

  expect(postWeddingBalance.sub(preWeddingBalance)).to.eq(
    value,
    'wedding balance should be incremented by value sent'
  )
  expect(preSenderBalance.sub(postSenderBalance)).to.eq(
    value.add(gasCost),
    'sender balance should be decremented by value sent + gasCost'
  )
  expect(wedding).to.eq(wng.address, 'wedding event should match wng address')
  expect(gifter).to.eq(
    wallet.address,
    'gifter event should match wallet address'
  )
  expect(eventValue).to.eq(value, 'eventValue should match value sent')
  expect(message).to.eq('', 'eventMessage be empty when used as fallback')
}

const testSendWeddingGift = async (context, wallet, value, message) => {
  const { wng: unconnected, wmr, provider } = context
  const wng = unconnected.connect(wallet)

  const preWeddingBalance = await provider.getBalance(wng.address)
  const preSenderBalance = await provider.getBalance(wallet.address)

  const giftEvent = waitForEvent(wmr, 'GiftReceived', 5000)
  const { wait, gasPrice } = await wng.sendWeddingGift(message, {
    value,
    gasLimit
  })
  const { gasUsed } = await wait()
  const gasCost = gasUsed.mul(gasPrice)
  const {
    args: { wedding, gifter, value: eventValue, message: eventMessage }
  } = await giftEvent

  const postWeddingBalance = await provider.getBalance(wng.address)
  const postSenderBalance = await provider.getBalance(wallet.address)

  expect(postWeddingBalance.sub(preWeddingBalance)).to.eq(
    value,
    'wedding balance should be incremented by value sent'
  )
  expect(preSenderBalance.sub(postSenderBalance)).to.eq(
    value.add(gasCost),
    'sender balance should be decremented by value sent + gasCost'
  )
  expect(wedding).to.eq(wng.address, 'wedding event should match wng address')
  expect(gifter).to.eq(
    wallet.address,
    'gifter event should match wallet address'
  )
  expect(eventValue).to.eq(value, 'eventValue should match value sent')
  expect(message).to.eq(
    eventMessage,
    'eventMessage be empty when used as fallback'
  )
}

module.exports = {
  testStartWedding,
  testUpdateVows,
  testAcceptProposal,
  testUpdateWeddingPhoto,
  testSendWeddingGiftFallback,
  testSendWeddingGift
}
