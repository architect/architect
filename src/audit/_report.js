let reads = require('./_reads')
let chalk = require('chalk')

module.exports = function _report(arc) {
  reads(arc, function done(err, result) {
    if (err) {
      console.log(err)
    }
    else {
      result.forEach(thing=> {
        let hasCustomTemplate = !!thing.path
        if (hasCustomTemplate) {
          console.log(chalk.green(thing.name), chalk.yellow(thing.role))
        }
        else {
          console.log(chalk.green(thing.name), chalk.blue(thing.role))
        }
      })
    }
  })
}
