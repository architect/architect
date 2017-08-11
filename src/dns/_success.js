var chalk = require('chalk')

module.exports = function _success(app, domain, callback) {
  var msg = '\n'
  
  msg += chalk.dim('success!\n')
  msg += chalk.underline.cyan(`https://${domain}\n`)
  msg += chalk.underline.cyan(`https://staging.${domain}\n`)

  console.log(msg)
  callback()
}
