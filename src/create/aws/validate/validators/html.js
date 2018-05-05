var http = require('../_http')

module.exports = function html(arc, raw) {
  return http('html', arc, raw)
}
