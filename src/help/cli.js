#!/usr/bin/env node
let exists = require('path-exists').sync
let join = require('path').join
let fs = require('fs')
let chalk = require('chalk')
let read = p=> fs.readFileSync(p).toString()
let inquirer = require('inquirer')
let clear = require('clear')

!async function main() {
  let cmd = process.argv.slice(0).reverse().shift()
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

  let raw = read(path)
  log(raw)
}()

function log(raw) {
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
