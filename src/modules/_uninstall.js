#!/usr/bin/env node
var exec = require('.')
var chalk = require('chalk')
var pkg = process.argv[2]

if (!pkg) {
  var {red, grey} = chalk
  console.log(red('error ') + grey(' missing package name to uninstall'))
  process.exit(1)
}

exec(`
  npm rm ${pkg} --save --production
`)
