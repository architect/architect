#!/usr/bin/env node
let sandbox = require('./start')
let options = process.argv
sandbox({options}, function _done(err) {
  if (err) {
    console.log(err)
    process.exit(1)
  }
})

