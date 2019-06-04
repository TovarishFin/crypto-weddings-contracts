require('dotenv').config()
const ethers = require('ethers')
const chalk = require('chalk')
const fs = require('fs')
const {
  abi: wmrAbi,
  bytecode: wmrCode
} = require('../build/WeddingManager.json')
const { abi: wngAbi, bytecode: wngCode } = require('../build/Wedding')
const { abi: pxyAbi, bytecode: pxyCode } = require('../build/UpgradeableProxy')

const writeLocation = './deployments.json'
const validNetworks = [
  'mainnet',
  'ropsten',
  'kovan',
  'rinkeby',
  'goerli',
  'private'
]

/* eslint-disable no-console */

const readCreateDeployments = () => {
  let deployments

  try {
    deployments = JSON.parse(fs.readFileSync(writeLocation))
  } catch (err) {
    if (err.message.includes('no such file')) {
      deployments = {}
      fs.writeFileSync(writeLocation, JSON.stringify(deployments, null, 4))
    } else {
      throw new Error('something strange happened with file read...')
    }
  }

  return deployments
}

const deploy = async () => {
  console.log(chalk.yellow('setting up deployment environment...'))

  const gasLimit = process.env.GAS_LIMIT || 5e6
  const network = process.env.NETWORK
  if (!validNetworks.includes(network)) {
    console.log(chalk.red(`invalid network! network given is: ${network}`))
  }

  const mnemonic = process.env.MNEMONIC
  if (!mnemonic) {
    console.log(chalk.red('no mnemonic supplied!'))
  }

  const provider =
    network === 'private'
      ? new ethers.providers.JsonRpcProvider('http://localhost:8545')
      : new ethers.getDefaultProvider(network)
  const wallet = new ethers.Wallet.fromMnemonic(mnemonic).connect(provider)

  console.log(chalk.cyan('deployment environment setup complete'))
  console.log(chalk.yellow('getting blockNumber deployment start...'))

  const deploymentBlock = await provider.getBlockNumber()

  console.log(chalk.cyan(`got current block: ${deploymentBlock}`))

  console.log(chalk.yellow('setting up weddingMaster...'))

  const wngMaster = await new ethers.ContractFactory(
    wngAbi,
    wngCode,
    wallet
  ).deploy()
  await wngMaster.deployed()

  console.log(chalk.cyan('weddingMaster setup complete'))
  console.log(chalk.yellow('setting up weddingManager...'))

  const wmrMaster = await new ethers.ContractFactory(
    wmrAbi,
    wmrCode,
    wallet
  ).deploy()
  await wmrMaster.deployed()

  console.log(chalk.cyan('weddingManager setup complete'))
  console.log(chalk.yellow('setting up weddingManager proxy...'))

  const wmrProxy = await new ethers.ContractFactory(
    pxyAbi,
    pxyCode,
    wallet
  ).deploy(wmrMaster.address)
  await wmrProxy.deployed()

  console.log(chalk.cyan('weddingManager proxy setup complete'))
  console.log(chalk.yellow('running post deployment state setup...'))

  const wmr = await new ethers.Contract(wmrProxy.address, wmrAbi, wallet)

  await wmr.initialize(wngMaster.address, { gasLimit })

  console.log(chalk.cyan('post deployment state setup complete'))
  console.log(
    chalk.yellow(`writing deployed contract addresses to ${writeLocation}`)
  )

  let deployments = readCreateDeployments()

  deployments = {
    ...deployments,
    [network]: {
      deploymentBlock,
      weddingMaster: wngMaster.address,
      weddingManagerMaster: wmrMaster.address,
      weddingManager: wmrProxy.address
    }
  }

  fs.writeFileSync(writeLocation, JSON.stringify(deployments, null, 4))

  console.log(chalk.cyan('contract addresses written to file'))
  console.log(chalk.magenta('all done!'))
}

/* eslint-enable no-console */

deploy()
