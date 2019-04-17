let chalk = require('chalk')

module.exports = function arcInvalid(err) {
  console.log(chalk.bold.red(`Error: .arc line ${err.linenumber}`), chalk.bold(err.message))
  if (err.raw) {
    prettyPrintArc(err)
  }
  if (err.detail) {
    console.log(err.detail)
    console.log('\n')
  }
  process.exit(1)
}

function prettyPrintArc(err) {
  let linenumber = 1
  console.log(chalk.dim('-----'))
  err.raw.split('\n').forEach(row=> {
    let fail = err.linenumber === linenumber
    let l = ''+linenumber
    let ln = fail? chalk.red(`▶${l.padStart(3, ' ')}.`) : chalk.dim(` ${l.padStart(3, ' ')}.`)
    let content = fail? chalk.yellow(row) : row
    console.log(`${ln} ${content}`)
    linenumber += 1
  })
  console.log(chalk.dim('-----'))
}
