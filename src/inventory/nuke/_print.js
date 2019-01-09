let chalk = require('chalk')
let _longest = require('../_get-longest-subject')

module.exports = function _print(inventory) {

  let longest = _longest(inventory)

  return {

    header(msg) {
      console.log('\n'+chalk.grey.bold(msg))
    },

    deleted(subject, arn) {
      var subj = `${subject} `.padEnd(longest, '.') + ' '
      console.log(chalk.dim(subj), chalk.red(arn))
    },

    notfound(msg) {
      let subj = `${msg} `.padEnd(longest, '.') + ' '
      console.log(chalk.dim(subj), chalk.yellow('ARN not found'))
    },

    error(msg) {
      console.log(chalk.red.bold('Error: '), chalk.white.bold(msg))
    }
  }
}
