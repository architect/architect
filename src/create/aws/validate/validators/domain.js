let isDomain = require('is-domain-name')
let Err = require('../_error-factory')
/**
 * domain
 * ---
 * validator for @domain
 *
 * - uses is-domain-name
 */
module.exports = function domain(arc, raw) {
  var errors = []
  if (arc.domain && !isDomain(arc.domain[0])) {
    errors.push(Err({
      message: `@domain is invalid`,
      linenumber: findLineNumber(arc.domain[0], raw),
      raw,
      arc,
      detail: ' ',
    }))
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
