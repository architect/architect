var rest = require('../_rest')

module.exports = function xml(arc, raw) {
  return rest('xml', arc, raw)
}
