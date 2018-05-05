var regexp = require('./_regexp')
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
module.exports = function app(arc) {
  var errors = []
  // validate app name
  var appname = Array.isArray(arc.app) && arc.app[0]
  if (appname) {
    // ensure appname is 20 chars or less
    if (appname.length > 20) {
      errors.push(Error('@app name too long; must be <= 20 characters'))
    }
    // ensure appname is alphanumeric, locase and dashes
    if (!regexp.appname.test(appname)) {
      errors.push(Error('@app name must start with a letter, be alphanumeric, lowercase and dasherized'))
    }
  }
  else {
    errors.push(ReferenceError('@app name is not defined'))
  }
  return errors
}
