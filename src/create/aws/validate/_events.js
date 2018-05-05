var regexp = require('./_regexp')

/**
 * events
 * ---
 * validators for @events
 *
 * Per the AWS SNS docs topic names are limited to:
 *
 * - 256 characters
 * - Alphanumeric characters plus hyphens (-) and underscores (_) are allowed
 * - Topic names must be unique within an AWS account
 *
 * Somewhat arbitrarily .arc validates:
 *
 * - 50 characters (so we have room to grow: remember this becomes part of the lambda name)
 * - lowercase alphanumeric plus hyphens (no underscores; for symmetry with other lambda names)
 *
 */
module.exports = function events(arc) {
  var errors = []
  if (arc.events) {
    var isNotString = v=> typeof v != 'string'
    var typesOk = Array.isArray(arc.events) && arc.events.filter(isNotString).length === 0
    if (!typesOk) {
      errors.push(Error(`@event invalid`))
    }
    else {
      arc.events.forEach(event=> {
        if (event.length > 50) {
          errors.push(Error(`@event ${event} greater than 50 characters (it is ${event.length}!)`))
        }
        if (!regexp.eventname.test(event)) {
          errors.push(Error(`@event ${event} invalid characters (must be lowercase, alphanumeric, dashes)`))
        }
      })
    }
  }
  return errors
}

