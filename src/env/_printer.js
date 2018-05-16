let chalk = require('chalk')
let error = msg=> console.log(chalk.bold.red('Error'), chalk.bold.white(msg))

module.exports = function printer(err, result) {
  if (err) {
    error(err.message)
  }
  else {
    let testing = result.filter(p=> p.env === 'testing')
    let staging = result.filter(p=> p.env === 'staging')
    let production = result.filter(p=> p.env === 'production')
    if (testing.length > 0) {
      console.log(chalk.dim('@testing'))
      testing.forEach(t=> {
        console.log(chalk.cyan.bold(t.name), chalk.cyan(t.value))
      })
      console.log('')
    }
    if (staging.length > 0) {
      console.log(chalk.dim('@staging'))
      staging.forEach(t=> {
        console.log(chalk.cyan.bold(t.name), chalk.cyan(t.value))
      })
      console.log('')
    }
    if (production.length > 0) {
      console.log(chalk.dim('@production'))
      production.forEach(t=> {
        console.log(chalk.cyan.bold(t.name), chalk.cyan(t.value))
      })
      console.log('')
    }
  }
}
