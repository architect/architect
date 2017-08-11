#!/usr/bin/env node
var waterfall = require('run-waterfall')
var parse = require('@architect/parser')
var exists = require('file-exists')
var fs = require('fs')
var path = require('path')
var dns = require('.')

var arcFile = path.join(process.cwd(), '.arc')

<!--wut h/t @feross-->
waterfall([
  function _exists(callback) {
    exists(arcFile, function _exists(err, exists) {
      if (err || !exists) {
        callback('missing .arc')
      }
      else {
        callback()
      }
    })
  },
  function _arcFileRead(callback) {
    fs.readFile(arcFile, callback)
  },
  function _arcFileParse(buffer, callback) {
    var arc = parse(buffer.toString())
    callback(null, arc)
  },
  function _arcFileValid(arc, callback) {
    // check for app
    var app = arc.app[0]
    var domain = arc.domain[0]
    var api = !!(arc.hasOwnProperty('html') || arc.hasOwnProperty('json'))
    if (!app) {
      callback('missing @app')
    }
    else if (!domain) {
      callback('missing @domain')
    }
    else if (!api) {
      callback('missing @html or @json')
    }
    else {
      callback(null, {app, domain})
    }
  }
],
function _done(err, plans) {
  if (err) {
    console.log(err)
    process.exit(1)
  }
  else {
    var noop = x=>!x
    dns(plans, noop)
  }
})
