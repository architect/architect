let parse = require('@architect/parser')
let inventory = require('../../inventory')
let path = require('path')
let fs = require('fs')

// FIXME support arc.yaml and arc.json here
module.exports = function _globs(callback) {
  let arcPath = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcPath).toString()
  let arc = parse(raw)
  inventory(arc, raw, function _inventory(err, report) {
    if (err) callback(err)
    else {
      callback(null, report.localPaths)
    }
  })
}
