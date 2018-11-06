#!/usr/bin/env node
let fs = require('fs')
let path = require('path')
let pkg = path.join(__dirname, '../../package.json')
let raw = fs.readFileSync(pkg).toString()
let parsed = JSON.parse(raw)

console.log(parsed.version)
