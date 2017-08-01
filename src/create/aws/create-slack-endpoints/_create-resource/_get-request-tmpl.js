module.exports = function _getReqTmpl(type) {
  return {
    'application/json': "$input.json('$')",
  }
}
