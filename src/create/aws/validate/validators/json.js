var rest = require('../_rest')

module.exports = function json(arc, raw) {
  return rest('json', arc, raw)
}
