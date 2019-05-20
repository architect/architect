let fs = require('fs')
let path = require('path')
let pkg = path.join(__dirname, '../../package.json')
let raw = fs.readFileSync(pkg).toString()
let parsed = JSON.parse(raw)

module.exports = parsed.version
