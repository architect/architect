let log = require('./_log')
let chalk = require('chalk')
let exists = require('path-exists').sync
let join = require('path').join
let fs = require('fs')
let inquirer = require('inquirer')

module.exports = {
  read: p=> fs.readFileSync(p).toString(),
  log,
  main: async function main(args) {
    let cmd = args.reverse().shift()
    let path = join(__dirname, 'doc', `${cmd}.md`)
    let found = exists(path)
    if (!found) {
      let result = await inquirer.prompt([{
        type: 'list',
        name: 'help',
        prefix: chalk.cyan.dim('@architect/workflows'),
        suffix: '',
        message: ' ',
        choices: fs.readdirSync(join(__dirname, 'doc')).map(i=> i.replace('.md', '')),
      }])
      path = join(__dirname, 'doc', `${result.help}.md`)
    }

    let raw = module.exports.read(path)
    module.exports.log(raw)
  }
}
