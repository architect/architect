let path = require('path')
let exists = require('path-exists').sync

module.exports = function read(arc, raw, inventory, callback) {
  let full = basepath=> path.join(basepath, '.arc-config')
  let configs = inventory.localPaths.map(full).filter(exists)
  callback(null, configs)
}
