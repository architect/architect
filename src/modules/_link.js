#!/usr/bin/env node
var exec = require('.')
var exists = require('file-exists').sync
var chalk = require('chalk')
var path = require('path')

var pathToPackage = path.join(process.cwd(), process.argv[2])
var pathToPackageJson = path.join(pathToPackage, 'package.json')

if (!exists(pathToPackageJson)) {
  var {red, yellow, grey} = chalk
  console.log(red('error ') + yellow(pathToPackageJson) + grey(' not found'))
  process.exit(1)
}

exec(`
  npm link ${pathToPackage}
`)
