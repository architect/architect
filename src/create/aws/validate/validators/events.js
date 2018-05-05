let regexp = require('../_regexp')
let Err = require('../_error-factory')

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
module.exports = function events(arc, raw) {
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
          errors.push(Err({
            message: `@events ${event} > 50 characters`,
            linenumber: findLineNumber(event, raw),
            raw,
            arc,
            detail: 'Event names must be 50 characters or less.',
          }))
        }
        if (!regexp.eventname.test(event)) {
          errors.push(Err({
            message: `@events ${event} contains invalid characters`,
            linenumber: findLineNumber(event, raw),
            raw,
            arc,
            detail: 'Event names must start with a letter and be lowercase, alphanumeric and dasherized.',
          }))
        }
      })
    }
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
