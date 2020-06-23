let chalk = require('chalk')
let { version } = require('../package.json')
let path = require('path')

module.exports = function printVersion () {
  let log = (label, value) => console.log(chalk.grey(`${label.padStart(13)}:`), chalk.cyan(value))
  log('Version', `Architect ${version}`)
  log('Installed to', path.resolve(path.join(__dirname, '..')))
  log('cwd', process.cwd())
}
