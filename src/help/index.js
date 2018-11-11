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
    let doc_dir = join(__dirname, '..', '..', 'doc')
    let path = join(doc_dir, `${cmd}.md`)
    let found = exists(path)
    if (!found) {
      let result = await inquirer.prompt([{
        type: 'list',
        name: 'help',
        prefix: chalk.cyan.dim('@architect/workflows'),
        suffix: '',
        message: ' ',
        choices: fs.readdirSync(doc_dir).map(i=> i.replace('.md', '')),
      }])
      path = join(doc_dir, `${result.help}.md`)
    }

    let raw = module.exports.read(path)
    module.exports.log(raw)
  }
}
