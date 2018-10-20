/* eslint "no-useless-escape": "off" */
let clear = require('clear')
let chalk = require('chalk')

module.exports = function log(raw) {
  clear()

  let head = v=> /^\#/.test(v)
  raw.trim().split('\n').forEach(line=> {
    if (head(line)) {
      console.log(chalk.bold.green(line))
    }
    else {
      console.log(chalk.green(line))
    }
  })
  console.log('')
  process.exit()
}
