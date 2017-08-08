module.exports = function _getResponseTemplates(type) {
  var noop = type
  return {
    'application/json': "$input.json('$')"
  }
}
