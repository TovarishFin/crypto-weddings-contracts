/* global artifacts, describe, it, before, beforeEach contract, web3 */
const assert = require('assert')
const BigNumber = require('bignumber.js')
// smart contracts
const WeddingManager = artifacts.require('WeddingManager')
const FlexibleWedding = artifacts.require('FlexibleWedding')
// test utils

const {
  testWillThrow,
  testContractDestroyed,
  getEtherBalance,
  getTxInfo,
  gasPrice
} = require('./utils/testUtils')

const {
  testSendWeddingMoney,
  testClaimWeddingMoney,
  testRejectPropsoal,
  testAcceptProposal,
  testAcceptAndMarry,
  testChangeWeddingPhoto,
  testPetitionForDivorce,
  testAgreeDivorce
} = require('./utils/tdw')

// default test values
const defaultMarriageFee = new BigNumber(25e16)
const defaultDivorceFee = new BigNumber(25e17)
const giftAmount = new BigNumber(1e18)
const weddingType = 1
const partner1Name = 'Ella'
const partner2Name = 'Bob'
const partner1Vows =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
const partner2Vows =
  'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

describe('when starting an unhappy wedding', () => {
  contract('FlexibleWedding', accounts => {
    const owner = accounts[0]
    // traditional wedding
    const partner1 = accounts[1]
    const partner2 = accounts[2]
    const gifter = accounts[3]
    let wdm
    let tdw

    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        partner1,
        partner1Name,
        partner1Vows,
        partner2,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2,
          value: defaultMarriageFee
        }
      )
      const tdwAddress = await wdm.weddingOf(partner2)
      tdw = await FlexibleWedding.at(tdwAddress)
    })

    it('should start with the correct values', async () => {
      const weddingManager = await tdw.weddingManager()
      const actualPartner1Address = await tdw.partner1()
      const actualPartner2Address = await tdw.partner2()
      const actualPartner2Name = await tdw.partner2Name()
      const actualPartner1Name = await tdw.partner1Name()
      const actualPartner1Vows = await tdw.partner1Vows()
      const actualPartner2Vows = await tdw.partner2Vows()
      const actualPartner1SaysYes = await tdw.partner1SaysYes()
      const actualPartner2SaysYes = await tdw.partner2SaysYes()
      const actualMarried = await tdw.married()

      assert.equal(
        weddingManager,
        wdm.address,
        'the weddingManager should be the address that created the wedding'
      )
      assert.equal(
        actualPartner1Address,
        partner1,
        'the partner1 should match actualPartner1Address'
      )
      assert.equal(
        actualPartner2Address,
        partner2,
        'the partner2 should match actualPartner2Address'
      )
      assert.equal(
        actualPartner2Name,
        partner2Name,
        'the partner2Name should match actualPartner2Name'
      )
      assert.equal(
        actualPartner1Name,
        partner1Name,
        'the partner1Name should match actualPartner1Name'
      )
      assert.equal(
        actualPartner1Vows,
        partner1Vows,
        'the partner1Vows should match actualPartner1Vows'
      )
      assert.equal(
        actualPartner2Vows,
        partner2Vows,
        weddingType,
        'the partner2Vows should match actualPartner2Vows'
      )
      assert.equal(
        false,
        actualPartner1SaysYes,
        'partner1SaysYes should start false'
      )
      assert.equal(
        false,
        actualPartner2SaysYes,
        'partner2SaysYes should start false'
      )
      assert.equal(false, actualMarried, 'the married should start false')
    })

    it('should NOT allow non fiances to say acceptProposal', async () => {
      await testWillThrow(tdw.acceptProposal, [
        {
          from: owner
        }
      ])
    })

    it('should NOT allow non fiances to say rejectProposal', async () => {
      await testWillThrow(tdw.rejectProposal, [
        {
          from: owner
        }
      ])
    })

    it('should NOT allow divorce before married even if fiance', async () => {
      await testWillThrow(tdw.divorce, [
        {
          from: partner1,
          value: defaultDivorceFee
        }
      ])
    })

    it('should NOT allow changeWeddingPhoto before married', async () => {
      await testWillThrow(tdw.changeWeddingPhoto, [
        'https://loremflickr.com/640/480/wedding',
        {
          from: partner1
        }
      ])
    })

    it('should destroy the contract and reward wedding money to non rejector', async () => {
      await testRejectPropsoal(
        tdw,
        gifter,
        giftAmount,
        partner1,
        partner2,
        partner2
      )
    })
  })
})

describe('when starting a happy wedding', () => {
  contract('FlexibleWedding', accounts => {
    const partner1 = accounts[1]
    const partner2 = accounts[2]
    const gifter = accounts[3]
    let wdm
    let tdw

    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        partner1,
        partner1Name,
        partner1Vows,
        partner2,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2,
          value: defaultMarriageFee
        }
      )
      const tdwAddress = await wdm.weddingOf(partner2)
      tdw = await FlexibleWedding.at(tdwAddress)
    })

    it('should send wedding money to the contract while wedding is pending', async () => {
      await testSendWeddingMoney(tdw, gifter, giftAmount)
    })

    it('should allow partner1 to claim wedding money while wedding is pending', async () => {
      await testClaimWeddingMoney(tdw, partner1)
    })

    it('should allow fiances to run acceptProposal', async () => {
      await testAcceptProposal(tdw, partner1, partner2, partner1)
    })

    it('should change to married after both fiances run acceptProposal', async () => {
      await testAcceptAndMarry(tdw, partner1, partner2, partner2)
    })

    it('should send wedding money to the contract while married', async () => {
      await testSendWeddingMoney(tdw, gifter, giftAmount)
    })

    it('should allow partner1 to claim wedding money while married', async () => {
      await testClaimWeddingMoney(tdw, partner1)
    })
  })
})

describe('when happily married', async () => {
  contract('FlexibleWedding', accounts => {
    const owner = accounts[0]
    const partner1 = accounts[1]
    const partner2 = accounts[2]
    let wdm
    let tdw

    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        partner1,
        partner1Name,
        partner1Vows,
        partner2,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2,
          value: defaultMarriageFee
        }
      )
      const tdwAddress = await wdm.weddingOf(partner2)
      tdw = await FlexibleWedding.at(tdwAddress)
      await testAcceptProposal(tdw, partner1, partner2, partner1)
      await testAcceptAndMarry(tdw, partner1, partner2, partner2)
    })

    it('fiances should NOT be able to run acceptProposal after married, even as fiance', async () => {
      await testWillThrow(tdw.acceptProposal, [
        {
          from: partner1
        }
      ])
    })

    it('should NOT be able to run rejectProposal after married, even as fiance', async () => {
      await testWillThrow(tdw.rejectProposal, [
        {
          from: partner1
        }
      ])
    })

    it('should NOT divorce as NON fiance', async () => {
      await testWillThrow(tdw.divorce, [
        {
          from: owner
        }
      ])
    })

    it('should NOT changeWeddingPhoto if NOT fiance', async () => {
      await testWillThrow(tdw.changeWeddingPhoto, [
        'http://somesite.com/somepicture.jpg',
        {
          from: owner
        }
      ])
    })

    it('should changeWeddingPhoto if fiance', async () => {
      await testChangeWeddingPhoto(tdw, partner1)
    })
  })
})

describe('when unhappily married', async () => {
  contract('FlexibleWedding/WeddingManager', accounts => {
    const partner1 = accounts[1]
    const partner2 = accounts[2]
    let wdm
    let tdw

    beforeEach('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding.sendTransaction(
        partner1,
        partner1Name,
        partner1Vows,
        partner2,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2,
          value: defaultMarriageFee
        }
      )
      const tdwAddress = await wdm.weddingOf(partner2)
      tdw = await FlexibleWedding.at(tdwAddress)
      await testAcceptProposal(tdw, partner1, partner2, partner2)
      await testAcceptAndMarry(tdw, partner1, partner2, partner1)
    })

    it('should divorce if both pay half', async () => {
      const preWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )
      const prePartner1Balance = await getEtherBalance(partner1)
      const prePartner2Balance = await getEtherBalance(partner2)

      const preMarried = await tdw.married()
      const preContractBalance = await getEtherBalance(tdw.address)

      const postPartner2Tx = await tdw.divorce.sendTransaction({
        from: partner2,
        gasPrice,
        value: defaultDivorceFee.div(2)
      })

      const postPartner2TxInfo = await getTxInfo(postPartner2Tx)
      const postPartner2Married = await tdw.married()
      const postPartner2Balance = await getEtherBalance(partner2)
      const postPartner2ContractBalance = await getEtherBalance(tdw.address)
      const expectedPostPartner2Balance = prePartner2Balance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postPartner2TxInfo.gasUsed))

      const postPartner1Tx = await tdw.divorce.sendTransaction({
        from: partner1,
        gasPrice,
        value: defaultDivorceFee.div(2)
      })

      const postPartner1TxInfo = await getTxInfo(postPartner1Tx)
      await testContractDestroyed(tdw.married, [])
      const postPartner1Balance = await getEtherBalance(partner1)
      // cannot get balance of postPartner1ContractBalance because contract selfdestructs here
      const postWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )
      const postPartner1ContractBalance = await getEtherBalance(tdw.address)
      const expectedPostPartner1Balance = prePartner1Balance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postPartner1TxInfo.gasUsed))

      assert(preMarried, 'this test should start married')
      assert.equal(
        postPartner2Balance.toString(),
        expectedPostPartner2Balance.toString(),
        'the partner2 balance should match expectedPostPartner2Balance'
      )
      assert.equal(
        postPartner2ContractBalance.minus(preContractBalance).toString(),
        defaultDivorceFee.div(2).toString(),
        'the contract balance should match expectedPostPartner2Balance'
      )
      assert(
        postPartner2Married,
        'married should still be true until other party divorces'
      )
      assert.equal(
        postPartner1Balance.toString(),
        expectedPostPartner1Balance.toString(),
        'the partner1 balance should match expectedPostPartner1Balance'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by defaultDivorceFee'
      )
      assert.equal(
        postPartner1ContractBalance.toString(),
        '0',
        'the contract balance should be 0 after selfdestructing'
      )
    })

    it('should divorce if one fiance pays all fees first', async () => {
      const preMarried = await tdw.married()
      const preWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )
      const prePartner1Balance = await getEtherBalance(partner1)
      const preWeddingContractBalance = await getEtherBalance(tdw.address)

      const postPartner1Tx = await tdw.divorce.sendTransaction({
        from: partner1,
        value: defaultDivorceFee,
        gasPrice
      })

      const postPartner1Married = await tdw.married()

      const postPartner1TxInfo = await getTxInfo(postPartner1Tx)
      const postPartner1Balance = await getEtherBalance(partner1)
      const postWeddingContractBalance = await getEtherBalance(tdw.address)
      const expectedPostPartner1Balance = prePartner1Balance
        .minus(defaultDivorceFee)
        .minus(gasPrice.mul(postPartner1TxInfo.gasUsed))

      await tdw.divorce.sendTransaction({
        from: partner2,
        value: 0,
        gasPrice
      })

      await testContractDestroyed(tdw.married, [])

      const finalWeddingContractBalance = await getEtherBalance(tdw.address)
      const postWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )

      assert(preMarried, 'should start test as married')
      assert(postPartner1Married, 'should still be married')
      assert.equal(
        postPartner1Balance.toString(),
        expectedPostPartner1Balance.toString(),
        'the balance should match expectedPostPartner1Balance'
      )
      assert.equal(
        postWeddingContractBalance.minus(preWeddingContractBalance).toString(),
        defaultDivorceFee.toString(),
        'the wedding contract should be decremented by the defaultDivorceFee'
      )
      assert.equal(
        finalWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should be 0 after divorced and selfdestructed'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by the defaultDivorceFee'
      )
    })

    it('should divorce if one pays all fees last', async () => {
      const preMarried = await tdw.married()
      const preWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )
      const prePartner2Balance = await getEtherBalance(partner2)
      const preWeddingContractBalance = await getEtherBalance(tdw.address)

      await tdw.divorce.sendTransaction({
        from: partner1,
        value: 0,
        gasPrice
      })

      const postPartner1Married = await tdw.married()

      const postPartner2Tx = await tdw.divorce.sendTransaction({
        from: partner2,
        value: defaultDivorceFee,
        gasPrice
      })

      const postPartner2TxInfo = await getTxInfo(postPartner2Tx)
      const postPartner2Balance = await getEtherBalance(partner2)
      const expectedPostPartner2Balance = prePartner2Balance
        .minus(defaultDivorceFee)
        .minus(gasPrice.mul(postPartner2TxInfo.gasUsed))

      await testContractDestroyed(tdw.married, [])

      const finalWeddingContractBalance = await getEtherBalance(tdw.address)
      const postWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )

      assert(preMarried, 'should start test as married')
      assert(postPartner1Married, 'should still be married')
      assert(
        preWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should start at 0'
      )
      assert.equal(
        postPartner2Balance.toString(),
        expectedPostPartner2Balance.toString(),
        'the balance should match expectedPostPartner2Balance'
      )
      assert.equal(
        finalWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should be 0 after divorced and selfdestructed'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by the defaultDivorceFee'
      )
    })

    it('should divorce if forget to pay the fees then divorce again with values that meet fee in the end', async () => {
      const preMarried = await tdw.married()
      const preWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )
      const preWeddingContractBalance = await getEtherBalance(tdw.address)

      await tdw.divorce.sendTransaction({
        from: partner1,
        value: 0,
        gasPrice
      })

      const postPartner1Married = await tdw.married()

      await tdw.divorce.sendTransaction({
        from: partner2,
        value: 0,
        gasPrice
      })

      const postPartner2Married = await tdw.married()

      const prePartner2Balance = await getEtherBalance(partner2)
      const prePartner1Balance = await getEtherBalance(partner1)

      const postPartner1Tx = await tdw.divorce.sendTransaction({
        from: partner1,
        value: defaultDivorceFee.div(2),
        gasPrice
      })

      const postPartner1PayMarried = await tdw.married()
      const postPartner1TxInfo = await getTxInfo(postPartner1Tx)
      const postPartner1Balance = await getEtherBalance(partner1)
      const expectedPostPartner1Balance = prePartner1Balance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postPartner1TxInfo.gasUsed))

      const postPartner2Tx = await tdw.divorce.sendTransaction({
        from: partner2,
        value: defaultDivorceFee.div(2),
        gasPrice
      })

      await testContractDestroyed(tdw.married, [])
      const postPartner2TxInfo = await getTxInfo(postPartner2Tx)
      const postPartner2Balance = await getEtherBalance(partner2)
      const expectedPostPartner2Balance = prePartner2Balance
        .minus(defaultDivorceFee.div(2))
        .minus(gasPrice.mul(postPartner2TxInfo.gasUsed))

      const finalWeddingContractBalance = await getEtherBalance(tdw.address)
      const postWeddingManagerContractBalance = await getEtherBalance(
        wdm.address
      )

      assert(preMarried, 'should start test as married')
      assert(postPartner1Married, 'should still be married')
      assert(postPartner2Married, 'should still be married')
      assert(postPartner1PayMarried, 'should still be married')
      assert(
        preWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should start at 0'
      )
      assert.equal(
        postPartner2Balance.toString(),
        expectedPostPartner2Balance.toString(),
        'the balance should match expectedPostPartner2Balance'
      )
      assert.equal(
        postPartner1Balance.toString(),
        expectedPostPartner1Balance.toString(),
        'the balance should match expectedPostPartner1Balance'
      )
      assert.equal(
        finalWeddingContractBalance.toString(),
        '0',
        'the wedding contract balance should be 0 after divorced and selfdestructed'
      )
      assert.equal(
        postWeddingManagerContractBalance
          .minus(preWeddingManagerContractBalance)
          .toString(),
        defaultDivorceFee.toString(),
        'the wedding manager contract balance should be incremented by the defaultDivorceFee'
      )
    })

    it('should NOT allow claiming wedding money while divorce is in progress', async () => {
      await tdw.divorce({ from: partner1 })
      await testWillThrow(tdw.claimWeddingMoney, [{ from: partner1 }])
    })
  })
})
