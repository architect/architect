module.exports = function _isApi(arc) {
  return arc.hasOwnProperty('html') ||
         arc.hasOwnProperty('json') ||
         arc.hasOwnProperty('css') ||
         arc.hasOwnProperty('js') ||
         arc.hasOwnProperty('text') ||
         arc.hasOwnProperty('xml') ||
         arc.hasOwnProperty('http')
}
