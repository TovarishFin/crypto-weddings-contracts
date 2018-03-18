const assert = require('assert')
const BigNumber = require('bignumber.js')

const {
  testContractDestroyed,
  sendTransaction,
  getEtherBalance,
  getTxInfo,
  gasPrice,
  bigZero
} = require('./testUtils')

const testSendWeddingMoney = async (tdw, sender, amount) => {
  const value = new BigNumber(amount)
  const preContractBalance = await getEtherBalance(tdw.address)
  const preSenderBalance = await getEtherBalance(sender)

  const txid = await sendTransaction({
    from: sender,
    value,
    to: tdw.address,
    gasPrice
  })

  const tx = await getTxInfo(txid)
  const expectedPostSenderBalance = preSenderBalance
    .sub(gasPrice.mul(tx.gasUsed))
    .sub(value)

  const postContractBalance = await getEtherBalance(tdw.address)
  const postSenderBalance = await getEtherBalance(sender)

  assert.equal(
    postContractBalance.sub(preContractBalance).toString(),
    value.toString(),
    'the contract balance should be incremented by the sent amount'
  )
  assert.equal(
    postSenderBalance.toString(),
    expectedPostSenderBalance.toString(),
    'the sender balance should match the expected value'
  )
}

const testClaimWeddingMoney = async (tdw, claimer) => {
  const preContractBalance = await getEtherBalance(tdw.address)
  const preClaimerBalance = await getEtherBalance(claimer)

  const txid = await tdw.claimWeddingMoney({
    from: claimer,
    gasPrice
  })

  const postContractBalance = await getEtherBalance(tdw.address)
  const postClaimerBalance = await getEtherBalance(claimer)
  const tx = await getTxInfo(txid)
  const expectedPostClaimerBalance = preClaimerBalance
    .sub(gasPrice.mul(tx.gasUsed))
    .add(preContractBalance)

  assert.equal(
    postContractBalance.toString(),
    bigZero.toString(),
    'the contract balance should be 0 after claimFee'
  )
  assert.equal(
    postClaimerBalance.toString(),
    expectedPostClaimerBalance.toString(),
    'the claimer balance should be incremented by the previous contract balance'
  )
}

const testRejectPropsoal = async (
  tdw,
  gifter,
  giftAmount,
  partner1,
  partner2,
  rejector
) => {
  await testSendWeddingMoney(tdw, gifter, giftAmount)
  const prePartner1Balance = await getEtherBalance(partner1)
  const prePartner2Balance = await getEtherBalance(partner2)
  const preContractBalance = await getEtherBalance(tdw.address)
  const prePartner1Address = await tdw.partner1()
  const prePartner2Address = await tdw.partner2()

  await tdw.rejectProposal.sendTransaction({
    from: rejector
  })
  const postPartner1Balance = await getEtherBalance(partner1)
  const postPartner2Balance = await getEtherBalance(partner2)
  const postContractBalance = await getEtherBalance(tdw.address)
  await testContractDestroyed(tdw.married, [])

  if (rejector === partner1) {
    assert.equal(
      postPartner2Balance.sub(prePartner2Balance).toString(),
      preContractBalance.toString(),
      'the partner2 (rejectee) balance should be incremented by the balance of the contract'
    )
  } else {
    assert.equal(
      postPartner1Balance.sub(prePartner1Balance).toString(),
      preContractBalance.toString(),
      'the partner1 (rejectee) balance should be incremented by the balance of the contract'
    )
  }

  assert.equal(
    postContractBalance.toString(),
    bigZero.toString(),
    'the contract balance should be 0 after wedding cancellation'
  )
  assert.equal(
    prePartner1Address,
    partner1,
    'the partner1 address should still be what was originally in the constructor'
  )
  assert.equal(
    prePartner2Address,
    partner2,
    'the partner2 address should still be what was originally in the constructor'
  )
}

const testAcceptProposal = async (tdw, partner1, partner2, acceptor) => {
  const prePartner2SaysYes = await tdw.partner2SaysYes()
  const prePartner1SaysYes = await tdw.partner1SaysYes()
  const preMarried = await tdw.married()
  await tdw.acceptProposal.sendTransaction({
    from: acceptor === partner1 ? partner1 : partner2
  })
  const postPartner2SaysYes = await tdw.partner2SaysYes()
  const postPartner1SaysYes = await tdw.partner1SaysYes()
  const postMarried = await tdw.married()

  assert(
    !prePartner1SaysYes,
    'partner1SaysYes should be false before this test'
  )
  assert(
    !prePartner2SaysYes,
    'partner2SaysYes should be false before this test'
  )
  assert(!preMarried, 'the test should start with married === false')
  assert(
    !postMarried,
    'married should still be false because partner1SaysYes === false'
  )

  if (acceptor === partner1) {
    assert(
      postPartner1SaysYes,
      'partner1SaysYes should be true after acceptProposal'
    )
  } else {
    assert(
      postPartner2SaysYes,
      'partner2SaysYes should be true after acceptProposal'
    )
  }
}

const testAcceptAndMarry = async (tdw, partner1, partner2, acceptor) => {
  const prePartner1SaysYes = await tdw.partner1SaysYes()
  const prePartner2SaysYes = await tdw.partner2SaysYes()
  const preMarried = await tdw.married()

  await tdw.acceptProposal.sendTransaction({
    from: acceptor
  })
  const postPartner1SaysYes = await tdw.partner1SaysYes()
  const postPartner2SaysYes = await tdw.partner2SaysYes()
  const postMarried = await tdw.married()

  assert(
    postPartner1SaysYes,
    'partner1SaysYes should be true after acceptProposal is called'
  )
  assert(
    postPartner2SaysYes,
    'partner2SaysYes should be true after acceptProposal is called'
  )
  assert.equal(
    preMarried,
    false,
    'the wedding status should be 0 (pending) before both fiances call acceptProposal'
  )
  assert.equal(
    postMarried,
    true,
    'the wedding status should be 1 (pending) after both fiances call acceptProposal'
  )

  if (acceptor === partner1) {
    assert(
      !prePartner1SaysYes,
      'partner1SaysYes should be false before acceptProposal is called'
    )
  } else {
    assert(
      !prePartner2SaysYes,
      'partner1SaysYes should be false before acceptProposal is called'
    )
  }
}

const testChangeWeddingPhoto = async (tdw, changer) => {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  let rand = ''
  for (let i = 0; i < 10; i++) {
    rand += letters[Math.floor(Math.random() * letters.length)]
  }

  const weddingPhoto = `http://somesite/${rand}.jpg`
  await tdw.changeWeddingPhoto.sendTransaction(weddingPhoto, {
    from: changer
  })

  const postWeddingPhoto = await tdw.weddingPhoto()

  assert(
    postWeddingPhoto === weddingPhoto,
    'the wedding photo should be that set in changeWeddingPhoto'
  )
}

const testPetitionForDivorce = async (
  twd,
  partner1,
  partner2,
  feeAmount,
  petitioner
) => {
  const value = new BigNumber(feeAmount)
  const prePartner1SaysYes = await twd.partner1SaysYes()
  const prePartner2SaysYes = await twd.partner2SaysYes()
  const prePetitionerBalance = await getEtherBalance(petitioner)
  const preContractBalance = await getEtherBalance(twd.address)

  const txid = await twd.divorce({
    from: petitioner,
    gasPrice,
    value
  })
  const tx = await getTxInfo(txid)

  const postPartner1SaysYes = await twd.partner1SaysYes()
  const postPartner2SaysYes = await twd.partner2SaysYes()
  const postPetitionerBalance = await getEtherBalance(petitioner)
  const postContractBalance = await getEtherBalance(twd.address)
  const expectedPostPetitionerBalance = prePetitionerBalance
    .sub(gasPrice.mul(tx.gasUsed))
    .sub(value)

  assert.equal(
    expectedPostPetitionerBalance.toString(),
    postPetitionerBalance.toString(),
    'post petitioner balance should match expected value'
  )
  assert.equal(
    postContractBalance.sub(preContractBalance).toString(),
    value.toString(),
    'contract ether balance should be incremented by value'
  )

  if (petitioner === partner1) {
    assert(
      prePartner1SaysYes,
      'partner1 must already be married in order to petition for divorce'
    )
    assert(
      !postPartner1SaysYes,
      'partner1SaysYes should no longer be true after petitioning for divorce'
    )
  } else {
    assert(
      prePartner2SaysYes,
      'partner1 must already be married in order to petition for divorce'
    )
    assert(
      !postPartner2SaysYes,
      'partner2SaysYes should no longer be true after petitioning for divorce'
    )
  }
}

const testAgreeDivorce = async (
  twd,
  partner1,
  partner2,
  feeAmount,
  petitioner
) => {
  const value = new BigNumber(feeAmount)
  const prePartner1SaysYes = await twd.partner1SaysYes()
  const prePartner2SaysYes = await twd.partner2SaysYes()
  const prePetitionerBalance = await getEtherBalance(petitioner)
  const preContractBalance = await getEtherBalance(twd.address)

  const txid = await twd.divorce({
    from: petitioner,
    gasPrice,
    value
  })
  const tx = await getTxInfo(txid)

  const postPartner1SaysYes = await twd.partner1SaysYes()
  const postPartner2SaysYes = await twd.partner2SaysYes()
  const postPetitionerBalance = await getEtherBalance(petitioner)
  const postContractBalance = await getEtherBalance(twd.address)
  const expectedPostPetitionerBalance = prePetitionerBalance
    .sub(gasPrice.mul(tx.gasUsed))
    .sub(value)

  assert.equal(
    expectedPostPetitionerBalance.toString(),
    postPetitionerBalance.toString(),
    'post petitioner balance should match expected value'
  )
  assert.equal(
    postContractBalance.sub(preContractBalance).toString(),
    value.toString(),
    'contract ether balance should be incremented by value'
  )

  if (petitioner === partner1) {
    assert(
      prePartner1SaysYes,
      'partner1 must already be married in order to petition for divorce'
    )
    assert(
      !postPartner1SaysYes,
      'partner1SaysYes should no longer be true after petitioning for divorce'
    )
  } else {
    assert(
      prePartner2SaysYes,
      'partner1 must already be married in order to petition for divorce'
    )
    assert(
      !postPartner2SaysYes,
      'partner2SaysYes should no longer be true after petitioning for divorce'
    )
  }
}

module.exports = {
  testSendWeddingMoney,
  testClaimWeddingMoney,
  testRejectPropsoal,
  testAcceptProposal,
  testAcceptAndMarry,
  testChangeWeddingPhoto,
  testPetitionForDivorce,
  testAgreeDivorce
}
