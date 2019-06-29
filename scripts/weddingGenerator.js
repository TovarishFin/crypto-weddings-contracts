require('dotenv').config()
const ethers = require('ethers')
const chalk = require('chalk')
const { abi: wmrAbi } = require('../build/WeddingManager.json')
const { abi: wngAbi } = require('../build/Wedding')
const deployments = require('../deployments')

const validNetworks = [
  'mainnet',
  'ropsten',
  'kovan',
  'rinkeby',
  'goerli',
  'private'
]

const defaultPath = "m/44'/60'/0'/0/0"

const gasLimit = process.env.GAS_LIMIT || 5e6

const network = process.env.NETWORK

const mnemonic = process.env.MNEMONIC

const gasPrice =
  ethers.utils.parseUnits(process.env.GAS_PRICE.toString(), 'gwei') ||
  ethers.utils.parseUnits('5', 'gwei')

const manNames = [
  'bob',
  'jeff',
  'thomas',
  'heikki',
  'carl',
  'marko',
  'jonathan'
]

const womanNames = [
  'alice',
  'jessica',
  'susanna',
  'mirko',
  'anukka',
  'sandra',
  'shauna'
]
const vowsPlaceholder = 'I will do stuff and things'
const photoPlaceholder =
  'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260'
const giftMessagePlaceholder = 'good luck buddy'

/* eslint-disable no-console */

if (!validNetworks.includes(network)) {
  console.log(chalk.red(`invalid network! network given is: ${network}`))
  process.exit(1)
}

if (!mnemonic) {
  console.log(chalk.red('no mnemonic supplied!'))
  process.exit(1)
}

const provider =
  network === 'private'
    ? new ethers.providers.JsonRpcProvider('http://localhost:8545')
    : new ethers.getDefaultProvider(network)

const getWallet = (pathLevel = 0) =>
  new ethers.Wallet.fromMnemonic(
    mnemonic,
    `m/44'/60'/0'/0/${pathLevel}`
  ).connect(provider)

const getWeddingManager = wallet =>
  new ethers.Contract(deployments[network].weddingManager, wmrAbi, wallet)

const getWedding = (wallet, weddingAddress) =>
  new ethers.Contract(weddingAddress, wngAbi, wallet)

const getTxWaitTime = () => {
  switch (network) {
    case 'mainnet':
      return 1000 * 60 * 5 // 5 minutes
    case 'private':
      return 1000 * 180 //  180 seconds
    default:
      return 1000 * 60 * 3 // 3 minutes
  }
}

const getRandomManName = () =>
  manNames[Math.floor(Math.random() * manNames.length)]

const getRandomWomanName = () =>
  womanNames[Math.floor(Math.random() * womanNames.length)]

const sendWeddingGift = async (
  walletPath,
  weddingAddress,
  message = giftMessagePlaceholder
) => {
  const wallet = getWallet(walletPath)
  const wng = getWedding(wallet, weddingAddress)
  const value = wng.minGiftAmount()

  console.log(chalk.yellow('sending wedding gift...'))
  const tx = await wng.sendWeddingGift(message, { value, gasLimit })
  await tx.wait()
  console.log(chalk.cyan('wedding gift sent'))
}

const createWedding = async (creatorPath = 0, acceptorPath = 1) => {
  const manName = getRandomManName()
  const womanName = getRandomWomanName()
  const creator = getWallet(creatorPath)
  const acceptor = getWallet(acceptorPath)

  const wmr = getWeddingManager(creator)
  let weddingAddress

  console.log(chalk.yellow('generating wedding...'))

  const weddingAdded = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `transaction timeout: more than ${getTxWaitTime() /
            1000} seconds have passed`
        )
      )
    }, getTxWaitTime())

    wmr.on('WeddingAdded', (wedding, partner1) => {
      if (partner1 === creator.address) {
        clearTimeout(timeout)
        return resolve(wedding)
      }
    })
  })

  try {
    const tx = await wmr.startWedding(manName, acceptor.address, womanName, {
      gasLimit
    })
    await tx.wait()

    weddingAddress = await weddingAdded
  } catch (err) {
    console.log(chalk.red('an error occurred!', err))
    process.exit(1)
  }

  wmr.removeAllListeners('WeddingAdded')

  console.log(
    chalk.cyan(`wedding created with an address of ${weddingAddress}`)
  )

  const wedding = new ethers.Contract(weddingAddress, wngAbi, creator)

  return {
    creator,
    acceptor,
    wedding
  }
}

const createInProgressWedding = async (creatorPath = 0, acceptorPath = 1) => {
  const context = await createWedding(creatorPath, acceptorPath)
  const { creator, wedding: unconnectedWng } = context
  const wng = unconnectedWng.connect(creator)
  let tx

  console.log(chalk.yellow('updating vows as creator...'))

  tx = await wng.updateVows(vowsPlaceholder, { gasLimit })
  await tx.wait()

  console.log(chalk.cyan('vow update as creator complete'))
  console.log(chalk.yellow('accepting proposal as creator...'))

  tx = await wng.acceptProposal({ gasLimit })
  await tx.wait()

  console.log(chalk.cyan('proposal acceptance as creator complete'))

  return context
}

const createMarriedWedding = async (creatorPath = 0, acceptorPath = 1) => {
  const context = await createInProgressWedding(creatorPath, acceptorPath)
  const { acceptor, wedding: unconnectedWng } = context
  const wng = unconnectedWng.connect(acceptor)
  let tx

  console.log(chalk.yellow('updating vows as acceptor...'))
  tx = await wng.updateVows(vowsPlaceholder, { gasLimit })
  await tx.wait()
  console.log(chalk.cyan('vow update as acceptor complete'))

  console.log(chalk.yellow('accepting proposal as acceptor...'))
  tx = await wng.acceptProposal({ gasLimit })
  await tx.wait()
  console.log(chalk.cyan('proposal acceptance as acceptor complete'))

  return context
}

const createMarriedWeddingWithPhoto = async (
  creatorPath = 0,
  acceptorPath = 1
) => {
  const context = await createMarriedWedding(creatorPath, acceptorPath)
  const { creator, wedding: unconnectedWng } = context
  const wng = unconnectedWng.connect(creator)

  console.log(chalk.yellow('updating wedding photo as creator...'))

  const tx = await wng.updateWeddingPhoto(photoPlaceholder, { gasLimit })
  await tx.wait()

  console.log(chalk.cyan('wedding photo update as creator complete'))

  return context
}

const createMarriedWeddingWithGifts = async (
  creatorPath = 0,
  acceptorPath = 1
) => {
  const context = await createMarriedWeddingWithPhoto(creatorPath, acceptorPath)
  const { wedding } = context

  await sendWeddingGift(19, wedding.address)

  return context
}

const createMarriedWeddingWithClaimedGifts = async (
  creatorPath = 0,
  acceptorPath = 1
) => {
  const context = await createMarriedWeddingWithGifts(creatorPath, acceptorPath)
  const { creator, wedding: unconnectedWng } = context
  const wng = unconnectedWng.connect(creator)

  console.log(chalk.yellow('claiming wedding gifts ...'))
  const tx = await wng.claimWeddingGifts({ gasLimit })
  await tx.wait()
  console.log(chalk.cyan('wedding gift claiming complete'))

  return context
}

const createAllWeddings = async () => {
  console.log(chalk.yellow('generating weddings...'))

  const initializedWedding = await createWedding(0, 1)
  const inProgressWedding = await createInProgressWedding(2, 3)
  const marriedWedding = await createMarriedWedding(4, 5)
  const marriedWeddingWithPhoto = await createMarriedWeddingWithPhoto(6, 7)
  const marriedWeddingWithGifts = await createMarriedWeddingWithGifts(8, 9)
  const marriedWeddingWithClaimedGifts = await createMarriedWeddingWithClaimedGifts(
    10,
    11
  )

  console.log(chalk.cyan('wedding generation complete'))

  console.log(chalk.cyan('all weddings generated. details below:'))
  console.log(
    chalk.bgMagenta('initializedWedding: ', initializedWedding.wedding.address)
  )
  console.log(
    chalk.bgMagenta('inProgressWedding: ', inProgressWedding.wedding.address)
  )
  console.log(
    chalk.bgMagenta('marriedWedding: ', marriedWedding.wedding.address)
  )
  console.log(
    chalk.bgMagenta(
      'marriedWeddingWithPhoto: ',
      marriedWeddingWithPhoto.wedding.address
    )
  )
  console.log(
    chalk.bgMagenta(
      'marriedWeddingWithGifts: ',
      marriedWeddingWithGifts.wedding.address
    )
  )
  console.log(
    chalk.bgMagenta(
      'marriedWeddingWithClaimedGifts: ',
      marriedWeddingWithClaimedGifts.wedding.address
    )
  )
}

const divorceRejectWedding = async (pathLevel = 0) => {
  console.log(
    chalk.yellow(
      `breaking up wedding using account with pathLevel of ${pathLevel}...`
    )
  )
  const wallet = getWallet(pathLevel)
  const weddingManager = getWeddingManager(wallet)
  const weddingOf = await weddingManager.weddingOf(wallet.address)

  if (weddingOf === '0x' + '00'.repeat(20)) {
    console.log(chalk.cyan('no wedding to breakup. ending...'))

    return
  }

  const wedding = getWedding(wallet, weddingOf)

  const stage = await wedding.stage()

  if (stage.toString() !== '3') {
    console.log(chalk.yellow('wedding is in non-married state...'))
    const tx = await wedding.rejectProposal({ gasLimit })
    await tx.wait()
    console.log(chalk.cyan('proposal rejected... wedding nuked'))
  } else {
    console.log(chalk.yellow('wedding is in married state...'))

    const partner1 = await wedding.partner1()
    const p1Answer = await wedding.p1Answer()
    const p2Answer = await wedding.p2Answer()
    const isPartner1 = wallet.address === partner1
    const hasDivorced = isPartner1 ? p1Answer === false : p2Answer === false

    if (hasDivorced) {
      console.log(chalk.cyan('wallet has already divorced. ending...'))

      return
    }

    const tx = await wedding.divorce({ gasLimit })
    await tx.wait()

    console.log(chalk.cyan('divorce sent... might have to wait for other'))
  }
}

const breakupAllWeddings = async () => {
  for (let i = 0; i < 20; i++) {
    await divorceRejectWedding(i)
  }
}

const fundAccounts = async () => {
  const funder = await getWallet(0)
  const config = {
    gasLimit,
    gasPrice: 21000,
    value: ethers.utils.parseEther('1.0')
  }

  console.log(
    chalk.yellow('seding 1 ether from first account to next 9 accounts')
  )

  let tx

  console.log(chalk.yellow('sending to account 1...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(1).address
  })
  await tx
  console.log(chalk.cyan('sending to account 1 successful'))

  console.log(chalk.yellow('sending to account 2...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(2).address
  })
  await tx
  console.log(chalk.cyan('sending to account 2 successful'))

  console.log(chalk.yellow('sending to account 3...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(3).address
  })
  await tx
  console.log(chalk.cyan('sending to account 3 successful'))

  console.log(chalk.yellow('sending to account 4...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(4).address
  })
  await tx
  console.log(chalk.cyan('sending to account 4 successful'))

  console.log(chalk.yellow('sending to account 5...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(5).address
  })
  await tx
  console.log(chalk.cyan('sending to account 5 successful'))

  console.log(chalk.yellow('sending to account 6...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(6).address
  })
  await tx
  console.log(chalk.cyan('sending to account 6 successful'))

  console.log(chalk.yellow('sending to account 7...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(7).address
  })
  await tx
  console.log(chalk.cyan('sending to account 7 successful'))

  console.log(chalk.yellow('sending to account 8...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(8).address
  })
  await tx
  console.log(chalk.cyan('sending to account 8 successful'))

  console.log(chalk.yellow('sending to account 9...'))
  tx = await funder.sendTransaction({
    ...config,
    to: getWallet(9).address
  })
  await tx
  console.log(chalk.cyan('sending to account 9 successful'))

  console.log(chalk.cyan('funds successfully sent!'))
}

console.log(
  chalk.bgGreen(`\n YOUR ARE ON THE ${network.toUpperCase()} NETWORK \n`)
)

module.exports = {
  breakupAllWeddings,
  divorceRejectWedding,
  createAllWeddings,
  createMarriedWeddingWithClaimedGifts,
  createMarriedWeddingWithGifts,
  sendWeddingGift,
  createMarriedWeddingWithPhoto,
  createMarriedWedding,
  createInProgressWedding,
  createWedding,
  getRandomWomanName,
  getRandomManName,
  getTxWaitTime,
  getWedding,
  getWeddingManager,
  getWallet,
  provider,
  womanNames,
  manNames,
  mnemonic,
  network,
  gasLimit,
  gasPrice,
  defaultPath,
  fundAccounts
}
