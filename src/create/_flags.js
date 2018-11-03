let chalk = require('chalk')

module.exports = function flags(arc, raw, callback) {
  if (process.env.ARC_DANGERZONE) {
    console.log(chalk.grey(chalk.green.dim('✓'), `dangerzone: engaged\n`))
  }
  let local = process.argv[2] && process.argv[2] === '--local' || process.argv[2] === '-l' || process.argv[2] === 'local'
  if (local) {
    process.env.ARC_LOCAL = true
  }
  callback(null, arc, raw, callback)
}
