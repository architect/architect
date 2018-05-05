var http = require('./_http')

module.exports = function json(arc) {
  return http('json', arc)
}
