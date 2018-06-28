let regexp = require('../_regexp')
let Err = require('../_error-factory')
/**
 * appname
 * ---
 * validator for @app
 *
 * - assert arc @app exists
 * - assert arc @app is less than or equal to 20 characters
 * - assert arc @app starts with a letter
 * - assert arc @app is otherwise lowcase alphanumeric and dashes only
 */
module.exports = function app(arc, raw) {
  var errors = []
  // validate app name
  var appname = Array.isArray(arc.app) && arc.app[0]
  if (appname) {
    // ensure appname is 10 chars or less
    if (appname.length > 10) {
      errors.push(Err({
        message: `@app name > 10 characters`,
        linenumber: findLineNumber(appname, raw),
        raw,
        arc,
        detail: '@app name must be 10 characters or less.',
      }))
    }
    // ensure appname is alphanumeric, locase and dashes
    if (!regexp.appname.test(appname)) {
      errors.push(Err({
        message: `@app name contains invalid characters`,
        linenumber: findLineNumber(appname, raw),
        raw,
        arc,
        detail: '@app name must start with a letter, be alphanumeric, lowercase and dasherized.',
      }))
    }
  }
  else {
    errors.push(ReferenceError('@app name is not defined'))
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
