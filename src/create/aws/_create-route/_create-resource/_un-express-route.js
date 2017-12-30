// helper to swap express style :paramID for api gateway style {paramID}
var unexpressPart = require('./_un-express-part')
module.exports = function unexpressRoute(completeRoute) {
  var parts = completeRoute.split('/')
  var better = parts.map(unexpressPart)
  return `${better.join('/')}`
}
