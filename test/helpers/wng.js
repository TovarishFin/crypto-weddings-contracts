const Wedding = require('../../build/Wedding')
const { gasLimit, waitForEvent } = require('../helpers/general')
const { testStartWedding: testNewWedding } = require('../helpers/wmr')
const {
  Contract,
  utils: { parseEther }
} = require('ethers')
const chalk = require('chalk')

const testStartWedding = async (context, partner1, partner2, name1, name2) => {
  const { address: p1Address } = partner1
  const { address: p2Address } = partner2
  const weddingAddress = await testNewWedding(
    context,
    partner1,
    partner2,
    name1,
    name2
  )

  const wng = new Contract(weddingAddress, Wedding.abi, partner1)

  const postPartner1 = await wng.partner1()
  const postP1Name = await wng.p1Name()
  const postPartner2 = await wng.partner2()
  const postP2Name = await wng.p2Name()
  const postStage = await wng.stage()
  const postMinGiftAmount = await wng.minGiftAmount()

  expect(postPartner1).to.eq(p1Address, 'postPartner1 should match p1Address')
  expect(postP1Name).to.eq(name1, 'postP1Name should match name1')
  expect(postPartner2).to.eq(p2Address, 'postPartner2 should match p2Address')
  expect(postP2Name).to.eq(name2, 'postP2Name should match named2')
  expect(postStage).to.eq(1, 'postStage should be 1, Initialized')
  expect(postMinGiftAmount).to.eq(
    parseEther('0.01'),
    'minGiftAmount should start at 1e16'
  )

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

const testClaimWeddingGifts = async (context, wallet) => {
  const { wng: unconnected, wmr, provider } = context
  const wng = unconnected.connect(wallet)

  const preWeddingBalance = await provider.getBalance(wng.address)
  const preClaimerBalance = await provider.getBalance(wallet.address)

  const giftEvent = waitForEvent(wmr, 'GiftClaimed', 5000)
  const { wait, gasPrice } = await wng.claimWeddingGifts({ gasLimit })
  const { gasUsed } = await wait()
  const gasCost = gasUsed.mul(gasPrice)
  const {
    args: { wedding, claimer, value }
  } = await giftEvent

  const postWeddingBalance = await provider.getBalance(wng.address)
  const postClaimerBalance = await provider.getBalance(wallet.address)

  expect(preWeddingBalance).to.not.eq(
    0,
    'wedding contract balance should be more than 0 when claiming'
  )
  expect(postWeddingBalance).to.eq(
    0,
    'wedding contract balance should be 0 after claiming'
  )
  expect(postClaimerBalance.sub(preClaimerBalance)).to.eq(
    preWeddingBalance.sub(gasCost),
    'claimer balance should be incremented by wedding balance offset by gas costs'
  )
  expect(wedding).to.eq(
    wng.address,
    'wedding event param should match wedding address'
  )
  expect(claimer).to.eq(
    wallet.address,
    'claimer event param should match wallet address'
  )
  expect(value).to.eq(preWeddingBalance, 'value should match preWeddingBalance')
}

const testRejectProposal = async (context, wallet) => {
  const { wng: unconnected, wmr, provider } = context
  const wng = unconnected.connect(wallet)

  const preWeddingBalance = await provider.getBalance(wng.address)
  const preRejectorBalance = await provider.getBalance(wallet.address)

  const cancelEvent = waitForEvent(wmr, 'WeddingCancelled', 5000)
  const { wait, gasPrice } = await wng.rejectProposal({ gasLimit })
  const { gasUsed } = await wait()
  const gasCost = gasUsed.mul(gasPrice)
  const {
    args: { wedding, cancellor }
  } = await cancelEvent

  const postRejectorBalance = await provider.getBalance(wallet.address)
  const postCode = await provider.getCode(wng.address)

  expect(postCode).to.eq('0x', 'postCode should be 0x after selfdestruct')
  expect(wedding).to.eq(wng.address, 'wedding should match correct address')
  expect(cancellor).to.eq(
    wallet.address,
    'cancellor should match wallet.address'
  )

  if (preWeddingBalance.gt(gasCost)) {
    expect(postRejectorBalance.gt(preRejectorBalance))
  }
}

const testDivorce = async (context, wallet) => {
  const { wng: unconnected, wmr, provider } = context
  const wng = unconnected.connect(wallet)
  const { isPartner1, isPartner2 } = await checkIsPartner(context, wallet)

  const partner1 = await wng.partner1()
  const partner2 = await wng.partner2()
  const preP1Answer = await wng.p1Answer()
  const preP2Answer = await wng.p2Answer()
  const preWeddingBalance = await provider.getBalance(wng.address)
  const preDivorcerBalance = await provider.getBalance(wallet.address)

  const divorcesEvent = waitForEvent(wmr, 'PartnerDivorces')
  const divorceEvent = waitForEvent(wmr, 'Divorced')
  const { wait, gasPrice } = await wng.divorce({ gasLimit })
  const { gasUsed } = await wait()
  const gasCost = gasUsed.mul(gasPrice)

  const postDivorcerBalance = await provider.getBalance(wallet.address)
  const postCode = await provider.getCode(wng.address)

  if ((isPartner1 && !preP2Answer) || (isPartner2 && !preP1Answer)) {
    const {
      args: { wedding, partner1: eventPartner1, partner2: eventPartner2 }
    } = await divorceEvent
    expect(postCode).to.eq('0x', 'postCode should be 0x after selfdestruct')
    expect(wedding).to.eq(wng.address, 'wedding should match correct address')
    expect(eventPartner1).to.eq(partner1, 'eventPartner1 should match partner1')
    expect(eventPartner2).to.eq(partner2, 'eventPartner2 should match partner2')

    if (preWeddingBalance.gt(gasCost)) {
      expect(postDivorcerBalance.gt(preDivorcerBalance))
    }
  } else if (isPartner1) {
    const postP1Answer = await wng.p1Answer()
    const postP2Answer = await wng.p2Answer()
    const {
      args: { wedding, partner }
    } = await divorcesEvent
    expect(postP1Answer).to.eq(
      false,
      'postP1Answer should be false after calling divorce'
    )
    expect(postP2Answer).to.eq(true, 'postP2Answer should be true')
    expect(wedding).to.eq(wng.address, 'wedding should match correct address')
    expect(partner).to.eq(partner1, 'event partner should match partner1')
  } else if (isPartner2) {
    const postP1Answer = await wng.p1Answer()
    const postP2Answer = await wng.p2Answer()
    const {
      args: { wedding, partner }
    } = await divorcesEvent
    expect(postP2Answer).to.eq(
      false,
      'postP2Answer should be false after calling divorce'
    )
    expect(postP1Answer).to.eq(true, 'postP1Answer should be true')
    expect(wedding).to.eq(wng.address, 'wedding should match correct address')
    expect(partner).to.eq(partner2, 'event partner should match partner2')
  } else {
    expect.fail('only partner1 or partner2 should be able to divorce.')
  }
}

const testBanUser = async (context, wallet, user) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)
  const preBanned = await wng.banned(user.address)

  await wng.updateUserPermissions(user.address, true, { gasLimit })

  const postBanned = await wng.banned(user.address)

  expect(preBanned).to.eq(false, 'user should NOT be banned before banning')
  expect(postBanned).to.eq(true, 'user should be banned after banning')
}

const testUnBanUser = async (context, wallet, user) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)
  const preBanned = await wng.banned(user.address)

  await wng.updateUserPermissions(user.address, false, { gasLimit })

  const postBanned = await wng.banned(user.address)

  expect(preBanned).to.eq(true, 'user should be banned before unbanning')
  expect(postBanned).to.eq(false, 'user should NOT be banned after unbanning')
}

const testUpdateMinGiftAmount = async (context, wallet, minGiftAmount) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)

  await wng.updateMinGiftAmount(minGiftAmount, { gasLimit })

  const postMinGiftAmount = await wng.minGiftAmount()

  expect(postMinGiftAmount).to.eq(
    minGiftAmount,
    'minGiftAmount should match amount set'
  )
}

const testHideGiftEvents = async (context, wallet) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)

  const preShouldHide = await wng.shouldHideGiftEvents()

  await wng.updateShouldHideGiftEvents(true, { gasLimit })

  const postShouldHide = await wng.shouldHideGiftEvents()

  expect(preShouldHide).to.eq(
    false,
    'shouldHideGiftEvents should be false before hiding'
  )
  expect(postShouldHide).to.eq(
    true,
    'shouldHideGiftEvents should be true after hiding'
  )
}

const testShowGiftEvents = async (context, wallet) => {
  const { wng: unconnected } = context
  const wng = unconnected.connect(wallet)

  const preShouldHide = await wng.shouldHideGiftEvents()

  await wng.updateShouldHideGiftEvents(false, { gasLimit })

  const postShouldHide = await wng.shouldHideGiftEvents()

  expect(preShouldHide).to.eq(
    true,
    'shouldHideGiftEvents should be true before unhiding'
  )
  expect(postShouldHide).to.eq(
    false,
    'shouldHideGiftEvents should be false after unhiding'
  )
}

module.exports = {
  testStartWedding,
  testUpdateVows,
  testAcceptProposal,
  testUpdateWeddingPhoto,
  testSendWeddingGiftFallback,
  testSendWeddingGift,
  testClaimWeddingGifts,
  testRejectProposal,
  testDivorce,
  testBanUser,
  testUnBanUser,
  testUpdateMinGiftAmount,
  testHideGiftEvents,
  testShowGiftEvents
}
