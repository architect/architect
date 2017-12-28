#!/usr/bin/env node
var path = require('path')
var generate = require('.')

generate({
  arcFile: path.join(process.cwd(), '.arc'),
  execute: true
},
function(err) {
  if (err) {
    console.error('Error creating resources: ', err)
  } else {
    console.log('\n')
  }
})
