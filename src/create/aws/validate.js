var regexp = {
  appname: /^[a-z][a-z|\-|0-9]+/,
}

// function that returns an array of errors if any exist
function validateAppName(arc) {
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


module.exports = function validate(arc, callback) {

  // setup error queue
  var errors = [].concat(validateAppName(arc))

  if (arc.html) {
    // TODO must be a tuple
    // TODO routes[0] must be either get or post
    // TODO routes[1] must be a valid url that starts with /
    // TODO routes[1] must not end in /
    // TODO routes must be unique
  }

  if (arc.static) {
    // expect arc.static = [['staging', 'some-bukkit'], ['production', 'some-other-bukkit']]
    var validTypes = Array.isArray(arc.static) && Array.isArray(arc.static[0]) && Array.isArray(arc.static[1])
    var validStaging = validTypes && arc.static[0][0] === 'staging' && arc.static[0].length === 2
    var validProduction = validTypes && arc.static[1][0] === 'production' && arc.static[1].length === 2
    var validLocally = validStaging && validProduction
    // TODO check staging has a valid bucket name
    // TODO check production has a valid bucket name
    if (!validLocally) {
      errors.push(Error('@static invalid'))
    }
  }

  // continue if everything is ok
  let ok = errors.length === 0
  if (ok) {
    callback(null, arc)
  }
  else {
    callback(errors)
  }
}
