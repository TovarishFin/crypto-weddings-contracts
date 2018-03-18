/* global artifacts, describe, it, before, contract, web3 */
const assert = require('assert')
const BigNumber = require('bignumber.js')
// smart contracts
const WeddingManager = artifacts.require('WeddingManager')
const FlexibleWedding = artifacts.require('FlexibleWedding')
// test utils

const {
  testWillThrow,
  getEtherBalance,
  getTxInfo,
  addressZero
} = require('./utils/testUtils')

// default test values
const defaultMarriageFee = new BigNumber(25e16)
const defaultDivorceFee = new BigNumber(25e17)
const gasPrice = new BigNumber(30e9)
const weddingType = 1
const partner1Name = 'Ella'
const partner2Name = 'Bob'
const partner1Vows =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
const partner2Vows =
  'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

describe('when deploying WeddingManager', () => {
  contract('WeddingManager', accounts => {
    const owner = accounts[0]
    const partner1Address = accounts[1]
    let wdm
    before('deploy contract', async () => {
      wdm = await WeddingManager.new()
    })

    it('should have the correct values', async () => {
      const actualMarriageFee = await wdm.marriageFee()
      const actualDivorceFee = await wdm.divorceFee()
      const weddings = await wdm.listWeddings()

      assert.equal(
        defaultMarriageFee.toString(),
        actualMarriageFee.toString(),
        'the actualMarriageFee should match defaultMarriageFee'
      )
      assert.equal(
        defaultDivorceFee.toString(),
        actualDivorceFee.toString(),
        'the actualDivorceFee should match defaultDivorceFee'
      )
      assert.equal(
        weddings.length,
        1,
        'the contract should start with a placeholder entry'
      )
    })

    it('should have correct owner', async () => {
      const actualOwner = await wdm.owner()
      assert.equal(owner, actualOwner, 'the actualOwner should match owner')
    })

    it('should NOT change the marriageFee when NOT owner', async () => {
      await testWillThrow(wdm.changeMarriageFee, [
        new BigNumber(25e12),
        {
          from: partner1Address
        }
      ])
    })

    it('should change the marriageFee when owner', async () => {
      const newMarriageFee = new BigNumber(25e13)
      await wdm.changeMarriageFee.sendTransaction(newMarriageFee, {
        from: owner
      })
      const postMarriageFee = await wdm.marriageFee()
      assert.equal(
        newMarriageFee.toString(),
        postMarriageFee.toString(),
        'the new marriage fee should equal newMarriageFee'
      )
    })

    it('should NOT change the divorceFee when NOT owner', async () => {
      await testWillThrow(wdm.changeDivorceFee, [
        new BigNumber(25e13),
        {
          from: partner1Address
        }
      ])
    })

    it('should change the divorceFee when owner', async () => {
      const newDivorceFee = new BigNumber(25e14)
      await wdm.changeDivorceFee.sendTransaction(newDivorceFee, {
        from: owner
      })
      const postDivorceFee = await wdm.divorceFee()
      assert.equal(
        newDivorceFee.toString(),
        postDivorceFee.toString(),
        'the newDivorceFee should match postDivorceFEe'
      )
    })
  })
})

describe('when handling weddings in WeddingManager', () => {
  contract('WeddingMangager', accounts => {
    const owner = accounts[0]
    // traditional wedding
    const partner1Address = accounts[1]
    const partner2Address = accounts[2]

    let wdm
    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
    })

    it('should NOT create a new wedding if the creator is NOT one of the fiances', async () => {
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        partner1Name,
        partner1Vows,
        partner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: accounts[9],
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if partner1 address is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        addressZero,
        partner1Name,
        partner1Vows,
        partner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if partner1 name is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        '',
        partner1Vows,
        partner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if partner1 vows are missing', async () => {
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        partner1Name,
        '',
        partner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if partner2 address is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        partner1Name,
        partner1Vows,
        addressZero,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if partner2 name is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        partner1Name,
        partner1Vows,
        partner2Address,
        '',
        partner2Vows,
        weddingType,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if partner2 vows are missing', async () => {
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        partner1Name,
        partner1Vows,
        addressZero,
        partner2Name,
        '',
        weddingType,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if NO weddingType', async () => {
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        partner1Name,
        partner1Vows,
        addressZero,
        partner2Name,
        partner2Vows,
        null,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should create a new traditional wedding as partner2', async () => {
      const preWeddings = await wdm.listWeddings()
      const prePartner2WeddingOf = await wdm.weddingOf(partner2Address)
      const prePartner1WeddingOf = await wdm.weddingOf(partner1Address)

      await wdm.startWedding.sendTransaction(
        partner1Address,
        partner1Name,
        partner1Vows,
        partner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner2Address,
          value: defaultMarriageFee
        }
      )

      const postWeddings = await wdm.listWeddings()
      const postPartner2WeddingOf = await wdm.weddingOf(partner2Address)
      const postPartner1WeddingOf = await wdm.weddingOf(partner1Address)

      assert.equal(
        postWeddings.length - preWeddings.length,
        1,
        'the length of weddings array should be incremented by 1'
      )
      assert(
        postWeddings[postWeddings.length - 1] !== addressZero,
        'the added wedding should NOT be address 0'
      )
      assert.equal(
        prePartner2WeddingOf,
        addressZero,
        'the prePartner2WeddingOf should be addressZero'
      )
      assert.equal(
        prePartner1WeddingOf,
        addressZero,
        'the prePartner1WeddingOf should be addressZero'
      )
      assert(
        postPartner2WeddingOf !== addressZero,
        'the postPartner2WeddingOf should NOT be addressZero'
      )
      assert(
        postPartner1WeddingOf !== addressZero,
        'the postPartner1WeddingOf should NOT be addressZero'
      )
      assert.equal(postPartner1WeddingOf, postPartner2WeddingOf)
    })

    it('should NOT create a new wedding if partner1 is already participating in a wedding', async () => {
      const otherPartner2Address = accounts[7]
      await testWillThrow(wdm.startWedding, [
        partner1Address,
        partner1Name,
        partner1Vows,
        otherPartner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner1Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if partner2 is already participating in a wedding', async () => {
      const otherPartner1Address = accounts[8]
      await testWillThrow(wdm.startWedding, [
        otherPartner1Address,
        partner1Name,
        partner1Vows,
        partner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner1Address,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT verify wedding if NOT owner', async () => {
      const wedding = await wdm.weddingOf(partner1Address)
      await testWillThrow(wdm.toggleWeddingVerification, [
        wedding,
        {
          from: partner1Address
        }
      ])
    })

    it('should verify wedding NOT verify weddings if NOT owner', async () => {
      const wedding = await wdm.weddingOf(partner1Address)
      const preVerified = await wdm.verifiedWedding(wedding)

      await wdm.toggleWeddingVerification.sendTransaction(wedding, {
        from: owner
      })

      const postVerified = await wdm.verifiedWedding(wedding)
      assert.equal(preVerified, false, 'the wedding should start unverified')
      assert.equal(
        postVerified,
        true,
        'the wedding be verified after toggleWeddingVerification'
      )
    })

    it('should NOT collect fees from contract if NOT owner', async () => {
      await testWillThrow(wdm.collectFees, [
        {
          from: partner1Address
        }
      ])
    })

    it('should collect fees from contract if owner', async () => {
      const preOwnerBalance = await getEtherBalance(owner)
      const preContractBalance = await getEtherBalance(wdm.address)

      const tx = await wdm.collectFees.sendTransaction({
        from: owner,
        gasPrice
      })
      const meta = await getTxInfo(tx)
      const expectedOwnerBalance = preOwnerBalance
        .add(preContractBalance)
        .minus(gasPrice.mul(meta.gasUsed))
      const postOwnerBalance = await getEtherBalance(owner)
      const postContractBalance = await getEtherBalance(wdm.address)
      assert.equal(
        postOwnerBalance.toString(),
        expectedOwnerBalance.toString(),
        'the entire contract balance should be transferred to owner'
      )
      assert.equal(
        postContractBalance.toString(),
        '0',
        'the contract balance should be 0 after collecting fees'
      )
    })

    it('should throw when money is just sent to the contract', done => {
      web3.eth.sendTransaction(
        {
          to: wdm.address,
          from: partner1Address,
          value: 1e18
        },
        (err, res) => {
          if (res) {
            assert(false, 'the contract should throw here')
          } else {
            assert(
              /revert|invalid opcode/.test(err),
              'the error should include invalid opcode or revert'
            )
          }

          done()
        }
      )
    })
  })
})

describe('when removing weddings', () => {
  contract('WeddingManager/WeddingContracts', accounts => {
    const owner = accounts[0]
    // traditional wedding
    const partner1Address = accounts[1]
    const partner2Address = accounts[2]

    let wdm
    let tdm
    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding(
        partner1Address,
        partner1Name,
        partner1Vows,
        partner2Address,
        partner2Name,
        partner2Vows,
        weddingType,
        {
          from: partner1Address,
          value: defaultMarriageFee
        }
      )
      const tdmAddress = await wdm.weddingOf(partner1Address)
      tdm = await FlexibleWedding.at(tdmAddress)
      await wdm.toggleWeddingVerification.sendTransaction(tdmAddress, {
        from: owner
      })
    })

    it('traditional wedding should exist and start verified', async () => {
      const actualPartner1Address = await tdm.partner1()
      const actualPartner2Address = await tdm.partner2()
      const weddingVerified = wdm.verifiedWedding(tdm.address)

      assert(
        actualPartner1Address !== addressZero,
        'the actualPartner1Address should NOT be uninitialized'
      )
      assert.equal(
        actualPartner1Address,
        partner1Address,
        'the actualPartner1Address should match that given to the constructor'
      )
      assert(
        actualPartner2Address !== addressZero,
        'the actualPartner2Address should nto be uninitialized'
      )
      assert.equal(
        actualPartner2Address,
        partner2Address,
        'the actualPartner2Address should match that given to the constructor'
      )
      assert(
        weddingVerified,
        'the wedding should start verified from before block'
      )
    })

    it('should destroy wedding when one of the participants rejects wedding', async () => {
      const preWeddingVerified = await wdm.verifiedWedding(tdm.address)
      const preWeddingIndex = await wdm.weddingIndex(tdm.address)
      const preWeddingListing = await wdm.weddings(preWeddingIndex)
      await tdm.rejectProposal({
        from: partner1Address
      })

      const postWeddingVerified = await wdm.verifiedWedding(tdm.address)
      const postWeddingIndex = await wdm.weddingIndex(tdm.address)
      const postWeddingListing = await wdm.weddings(preWeddingIndex)

      assert(preWeddingVerified, 'the wedding should start verified')
      assert(
        preWeddingIndex.toNumber() > 0,
        'the wedding should have an index other than placeholder'
      )
      assert(
        preWeddingListing !== addressZero,
        'the wedding in weddings should NOT be addressZero'
      )
      assert(
        !postWeddingVerified,
        'the wedding should NOT be verified after selfdestruct'
      )
      assert(
        postWeddingIndex.toNumber() === 0,
        'the weddingIndex should be 0 (uninitialized)'
      )
      assert(
        postWeddingListing === addressZero,
        'the wedding listing should be addressZero'
      )
    })
  })
})
