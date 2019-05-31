const utils = require('./weddingGenerator')
const chalk = require('chalk')

Object.keys(utils).forEach(key => (global[key] = utils[key]))

global.utils = utils

/* eslint-disable no-console */

console.log(chalk.cyan('the following utilities are available: '))
Object.keys(utils).forEach(util => console.log(chalk.yellow(util)))

/* eslint-enable no-console */
