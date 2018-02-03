module.exports = function _getResponseTemplates() {
  return {
    'application/json': "$input.json('$')"
  }
}
