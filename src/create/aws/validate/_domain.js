var isDomain = require('is-domain-name')
/**
 * domain
 * ---
 * validator for @domain
 *
 * - uses is-domain-name
 */
module.exports = function domain(arc) {
  var errors = []
  if (arc.domain && !isDomain(arc.domain[0])) {
    errors.push(Error('@domain is invalid'))
  }
  return errors
}

