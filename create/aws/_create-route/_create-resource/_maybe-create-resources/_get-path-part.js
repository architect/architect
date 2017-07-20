module.exports = function _getPathPart(part) {
  var last = part.split('/').slice(0).pop()
  if (last[0] === ':') {
    return `{${last.replace(':', '')}}`
  }
  return last
}
