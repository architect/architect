#!/usr/bin/env node
let help = require('./index')
help.main(process.argv.slice(0)).catch(e => {
  console.error('Error printing help text!', e)
})
