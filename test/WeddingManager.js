/* global artifacts, describe, it, before, contract, web3 */
const assert = require('assert')
const BigNumber = require('bignumber.js')
// smart contracts
const WeddingManager = artifacts.require('WeddingManager')
const TraditionalWedding = artifacts.require('TraditionalWedding')
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

describe('when deploying WeddingManager', () => {
  contract('WeddingManager', accounts => {
    const owner = accounts[0]
    const brideAddress = accounts[1]
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
          from: brideAddress
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
          from: brideAddress
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
    /* eslint-disable max-len */
    const owner = accounts[0]
    // traditional wedding
    const brideAddress = accounts[1]
    const groomAddress = accounts[2]
    const brideName = 'Ella'
    const groomName = 'Bob'
    const brideVows =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
    const groomVows =
      'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

    let wdm
    /* eslint-enable max-len */
    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
    })

    it('should NOT create a new wedding if the creator is NOT one of the fiances', async () => {
      await testWillThrow(wdm.startWedding, [
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: accounts[9],
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if bride address is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        addressZero,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if bride name is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        brideAddress,
        '',
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if bride vows are missing', async () => {
      await testWillThrow(wdm.startWedding, [
        brideAddress,
        brideName,
        '',
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if groom address is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        brideAddress,
        brideName,
        brideVows,
        addressZero,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if groom name is missing', async () => {
      await testWillThrow(wdm.startWedding, [
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        '',
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if groom vows are missing', async () => {
      await testWillThrow(wdm.startWedding, [
        brideAddress,
        brideName,
        brideVows,
        addressZero,
        groomName,
        '',
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should create a new traditional wedding as groom', async () => {
      const preWeddings = await wdm.listWeddings()
      const preGroomWeddingOf = await wdm.weddingOf(groomAddress)
      const preBrideWeddingOf = await wdm.weddingOf(brideAddress)

      await wdm.startWedding.sendTransaction(
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: groomAddress,
          value: defaultMarriageFee
        }
      )

      const postWeddings = await wdm.listWeddings()
      const postGroomWeddingOf = await wdm.weddingOf(groomAddress)
      const postBrideWeddingOf = await wdm.weddingOf(brideAddress)

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
        preGroomWeddingOf,
        addressZero,
        'the preGroomWeddingOf should be addressZero'
      )
      assert.equal(
        preBrideWeddingOf,
        addressZero,
        'the preBrideWeddingOf should be addressZero'
      )
      assert(
        postGroomWeddingOf !== addressZero,
        'the postGroomWeddingOf should NOT be addressZero'
      )
      assert(
        postBrideWeddingOf !== addressZero,
        'the postBrideWeddingOf should NOT be addressZero'
      )
      assert.equal(postBrideWeddingOf, postGroomWeddingOf)
    })

    it('should NOT create a new wedding if bride is already participating in a wedding', async () => {
      const otherGroomAddress = accounts[7]
      await testWillThrow(wdm.startWedding, [
        brideAddress,
        brideName,
        brideVows,
        otherGroomAddress,
        groomName,
        groomVows,
        {
          from: brideAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT create a new wedding if groom is already participating in a wedding', async () => {
      const otherBrideAddress = accounts[8]
      await testWillThrow(wdm.startWedding, [
        otherBrideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: brideAddress,
          value: defaultMarriageFee
        }
      ])
    })

    it('should NOT verify wedding if NOT owner', async () => {
      const wedding = await wdm.weddingOf(brideAddress)
      await testWillThrow(wdm.toggleWeddingVerification, [
        wedding,
        {
          from: brideAddress
        }
      ])
    })

    it('should verify wedding NOT verify weddings if NOT owner', async () => {
      const wedding = await wdm.weddingOf(brideAddress)
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
          from: brideAddress
        }
      ])
    })

    it('should collect fees from contract if owner', async () => {
      const preOwnerBalance = await getEtherBalance(web3, owner)
      const preContractBalance = await getEtherBalance(web3, wdm.address)

      const tx = await wdm.collectFees.sendTransaction({
        from: owner,
        gasPrice
      })
      const meta = await getTxInfo(web3, tx)
      const expectedOwnerBalance = preOwnerBalance
        .add(preContractBalance)
        .minus(gasPrice.mul(meta.gasUsed))
      const postOwnerBalance = await getEtherBalance(web3, owner)
      const postContractBalance = await getEtherBalance(web3, wdm.address)
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
          from: brideAddress,
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
    /* eslint-disable max-len */
    const owner = accounts[0]
    // traditional wedding
    const brideAddress = accounts[1]
    const groomAddress = accounts[2]
    const brideName = 'Ella'
    const groomName = 'Bob'
    const brideVows =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam nunc, rutrum hendrerit odio eu, fermentum ultrices elit. Cras et dolor fringilla, blandit arcu id, fringilla mauris. Quisque imperdiet felis arcu, vel dapibus ipsum vulputate eget. Integer suscipit feugiat velit nec vulputate. Nam euismod enim nec orci facilisis faucibus. Morbi et leo a nibh suscipit cursus. Fusce quis tempus lacus, et consectetur turpis. Vivamus eu neque rhoncus, suscipit diam nec, pellentesque urna. Nullam aliquet, ipsum porta tincidunt facilisis, ipsum quam aliquet lectus, non egestas lacus sapien vitae nibh. Mauris consequat eget quam non ornare.'
    const groomVows =
      'Proin ut ultrices lectus. Duis sed commodo ligula. Sed fringilla metus et condimentum malesuada. Proin consectetur eros diam, ac sagittis ligula efficitur at. In nulla turpis, iaculis nec cursus posuere, luctus accumsan lacus. Ut in neque convallis, aliquam tellus sit amet, porttitor elit. Etiam efficitur ante quis lacus elementum, nec semper quam ultrices. Nunc congue lobortis libero non porta. Etiam ante leo, gravida non sem at, porta scelerisque libero. Nam consequat, nunc eget euismod dapibus, nibh ex maximus quam, a interdum diam augue sed ante. Praesent finibus tincidunt augue, vitae auctor dolor viverra ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur tincidunt rutrum risus, nec dignissim urna gravida at. Nunc pulvinar felis aliquet, accumsan dolor vitae, tristique odio.'

    let wdm
    let tdm
    /* eslint-enable max-len */
    before('setup contract/state', async () => {
      wdm = await WeddingManager.new()
      await wdm.startWedding(
        brideAddress,
        brideName,
        brideVows,
        groomAddress,
        groomName,
        groomVows,
        {
          from: brideAddress,
          value: defaultMarriageFee
        }
      )
      const tdmAddress = await wdm.weddingOf(brideAddress)
      tdm = await TraditionalWedding.at(tdmAddress)
      await wdm.toggleWeddingVerification.sendTransaction(tdmAddress, {
        from: owner
      })
    })

    it('traditional wedding should exist and start verified', async () => {
      const actualBrideAddress = await tdm.bride()
      const actualGroomAddress = await tdm.groom()
      const weddingVerified = wdm.verifiedWedding(tdm.address)

      assert(
        actualBrideAddress !== addressZero,
        'the actualBrideAddress should NOT be uninitialized'
      )
      assert.equal(
        actualBrideAddress,
        brideAddress,
        'the actualBrideAddress should match that given to the constructor'
      )
      assert(
        actualGroomAddress !== addressZero,
        'the actualGroomAddress should nto be uninitialized'
      )
      assert.equal(
        actualGroomAddress,
        groomAddress,
        'the actualGroomAddress should match that given to the constructor'
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

      await tdm.rejectProposal.sendTransaction({
        from: brideAddress
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
