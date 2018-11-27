let inventory = require('../../inventory')
let path = require('path')

module.exports = function _read(params) {
  let {filters, arc, raw} = params
  return function read(callback) {
    inventory(arc, raw, function _inventory(err, report) {
      if (err) callback(err)
      else {
        // if filters exist only deploy functions of that type
        function filter(p) {
          if (filters.length === 0)
            return true
          let predicate = false
          filters.forEach(section=> {
            let current = path.join('src', section)
            if (p.startsWith(current)) {
              predicate = true
            }
          })
          return predicate
        }
        callback(null, report.localPaths.filter(filter))
      }
    })
  }
}
