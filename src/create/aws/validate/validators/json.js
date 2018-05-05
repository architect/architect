var http = require('../_http')

module.exports = function json(arc, raw) {
  return http('json', arc, raw)
}
