// returns a function name from a route path
module.exports = function _getPath(route) {
  return route === '/'? '-index' : route.replace(/\//g, '-').replace(/\./g, '-').replace(/:/g, '000')
}
