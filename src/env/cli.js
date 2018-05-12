#!/usr/bin/env node
let parse = require('@architect/parser')
let fs = require('fs')
let path = require('path')

let _put = require('./_put')
let _del = require('./_del')
let _one = require('./_one')
let _all = require('./_all')

// get the current app name
let arcPath = path.join(process.cwd(), '.arc')
let appname = parse(fs.readFileSync(arcPath).toString()).app[0]

// parse the command
let copy = process.argv.slice(0)
let node = copy.shift()
let bin = copy.shift()

if (copy.includes('--put') {
  // put
  _put(copy)
}
else if (copy.includes('--delete')) {
  // del
  _del(copy)
}
else if (copy.length === 1) {
  // read one env
  _one(copy)
}
else {
  // read all
  _all(copy)
}

