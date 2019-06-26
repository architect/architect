#!/usr/bin/env node
let sandbox = require('@architect/sandbox')
let ver = require('../../package.json').version
let options = process.argv
let params = {
  options,
  version: `Architect ${ver}`
}
sandbox.cli(params)
