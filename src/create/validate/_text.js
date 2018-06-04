let Err = require('./_error-factory')
let validPath = require('./_valid-path')

/**
 * text
 * ---
 * validators for @text
 */
module.exports = function _text(type, arc, raw) {
  var errors = []
  if (arc[type]) {
    // text sections are arrays of tuples
    arc[type].forEach(route=> {
      var err = validPath(route)
      if (err) {
        errors.push(Err({
          message: `@${type} invalid route`,
          linenumber: findLineNumber(route, raw),
          raw,
          arc,
          detail: err.message + ' HTTP reference: https://arc.codes/guides/http',
        }))
      }
    })
  }
  return errors
}

function findLineNumber(search, raw) {
  var lines = raw.split('\n')
  for (var i = 0; i <= lines.length; i++) {
    if (lines[i] && lines[i].startsWith(search)) {
      return i + 1
    }
  }
  return -1
}
