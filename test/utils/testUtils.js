const assert = require('assert')

async function testWillThrow(fn, args) {
  try {
    await fn(...args)
    assert(false, 'the contract should throw here')
  } catch (error) {
    assert(
      // TODO: is this actually ok to check for revert here? need to investigate more...
      /invalid opcode|revert/.test(error),
      `the error message should be invalid opcode, the error was ${error}`
    )
  }
}

function getEtherBalance(web3, address) {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err, res) => {
      if (err) reject(err)

      resolve(res)
    })
  })
}

function getTxInfo(web3, txHash) {
  return new Promise((resolve, reject) => {
    web3.eth.getTransactionReceipt(txHash, (err, res) => {
      if (err) {
        reject(err)
      }

      resolve(res)
    })
  })
}

const addressZero = `0x${'0'.repeat(40)}`

module.exports = {
  testWillThrow,
  getEtherBalance,
  getTxInfo,
  addressZero
}
