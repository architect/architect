var isDomain = require('is-domain-name')

// solve and create all our problems in one place
var regexp = {
  appname: /^[a-z][a-z|\-|0-9]+/,
}

//
// all validator functions below:
//
// - accept a parsed arc object
// - return an array of error objects
//


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
function appname(arc) {
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

/**
 * domain
 * ---
 * validator for @domain
 *
 * - uses is-domain-name
 */
function domain(arc) {
  var errors = []
  if (arc.domain && !isDomain(arc.domain[0])) {
    errors.push(Error('@domain is invalid'))
  }
  return errors
}

/**
 * domain
 * ---
 * validator for @static
 *
 * - asserts arc.static is an array of two tuples (say that three times fast)
 * - asserts the first element of the first tuple is 'staging'
 * - asserts the first element of the second tuple is 'production'
 */
function static(arc) {
  var errors = []
  if (arc.static) {
    // expect arc.static = [['staging', 'some-bukkit'], ['production', 'some-other-bukkit']]
    var validTypes = Array.isArray(arc.static) && Array.isArray(arc.static[0]) && Array.isArray(arc.static[1])
    var validStaging = validTypes && arc.static[0][0] === 'staging' && arc.static[0].length === 2
    var validProduction = validTypes && arc.static[1][0] === 'production' && arc.static[1].length === 2
    var validLocally = validStaging && validProduction
    if (!validLocally) {
      errors.push(Error('@static invalid'))
    }
  }
  return errors
}

/**
 * http
 * ---
 * validators for @html, @json
 */
function _http(type, arc) {
  var errors = []
  if (arc[type]) {
    // http sections are arrays of tuples
    var isTuple = v=> Array.isArray(v) && v.length === 2
    var validTypes = Array.isArray(arc[type]) && arc[type].map(isTuple)
    if (!validTypes) {
      errors.push(Error(`@${type} is invalid`))
    }
    else {
      // if the shape of the data is ok we can check the contents
      // routes must be either get or post
      function notGetOrPost(tuple) {
        var v = tuple[0].toLowerCase()
        if (v === 'get') return false
        if (v === 'post') return false
        return true
      }
      var invalidVerbs = arc[type].filter(notGetOrPost)
      invalidVerbs.forEach(fkdtuple=> {
        errors.push(Error(`@${type} can only be GET or POST; unknown verb ${fkdtuple[0]}`))
      })
      /*
      var validUrl =   // TODO routes[1] must be a valid url that starts with /
      var noTrailingSlash =  // TODO routes[1] must not end in /
      var uniq =   // TODO routes must be unique
      */
    }
  }
  return errors
}
// alias impls
let html = arc=> _http('html', arc)
let json = arc=> _http('json', arc)

var events = ()=>[]
var slack = ()=>[]
var scheduled = ()=>[]
var tables = ()=>[]
var indexes = ()=>[]






/**
 * validates a parsed .arc file
 */
module.exports = function validate(arc, callback) {

  // an array of the validators above
  // we'll map over this array applying each validater to the passed in arc object
  let validators = [
    appname,
    domain,
    static,
    html,
    json,
    events,
    slack,
    scheduled,
    tables,
    indexes,
  ]

  // map function: accepts a validater; applies it to arc
  let validate = validator=> validator(arc)

  // reduce function: just concats the error arrays into one array
  let flatten = (a, b)=> a.concat(b)

  // the final collection of errors
  let errors = validators.map(validate).reduce(flatten)

  // continue if everything is ok
  let ok = errors.length === 0
  if (ok) {
    callback(null, arc)
  }
  else {
    // fail early and loudly if not
    callback(errors)
  }
}
