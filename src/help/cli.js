#!/usr/bin/env node
let chalk = require('chalk')
let exists = require('path-exists').sync
let join = require('path').join
let fs = require('fs')
let read = p=> fs.readFileSync(p).toString()
let inquirer = require('inquirer')
let log = require('./_log')

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

