var chalk = require('chalk')

/**
 * pretty print stuff to stdout
 */
module.exports = {

  skip(section, resource) {
    var skip = chalk.dim('skip')
    var sect = chalk.dim(section)
    var item = chalk.dim.cyan(resource)
    var exis = chalk.dim('exists')
    console.log(`${skip} ${sect} ${item} ${exis}`)
  },

  create(section, resource) {
    var skip = chalk.green('create')
    var sect = chalk.grey(section)
    var item = chalk.bold.blue(resource)
    console.log(`${skip} ${sect} ${item}`)
  }
}
