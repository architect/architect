#!/usr/bin/env node
var exec = require('.')
var chalk = require('chalk')
var pkg = process.argv[2]

if (!pkg) {
  pkg = ''
}

exec(`
  npm i ${pkg} --save --production
`)
