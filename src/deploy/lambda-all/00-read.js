let parse = require('@architect/parser')
let inventory = require('../../inventory')
let path = require('path')
let fs = require('fs')

// FIXME support arc.yaml and arc.json here
module.exports = function _read(params) {
  return function read(callback) {
    let arcPath = path.join(process.cwd(), '.arc')
    let raw = fs.readFileSync(arcPath).toString()
    let arc = parse(raw)
    inventory(arc, raw, function _inventory(err, report) {
      if (err) callback(err)
      else {
        // if args.filters exists only deploy functions in that type
        function filter(p) {
          if (params.filters.length === 0) return true
          let predicate = false
          params.filters.forEach(section=> {
            let current = path.join('src', section)
            if (p.startsWith(current)) {
              predicate = true
            }
          })
          return predicate
        }
        let paths = report.localPaths.filter(filter)
        callback(null, paths)
      }
    })
  }
}
