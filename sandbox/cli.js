#!/usr/bin/env node
var start = require('./start')
var noop = x=>!x
start(noop)
