var app = require('./validators/app')
var domain = require('./validators/domain')
var events = require('./validators/events')
var html = require('./validators/html')
var indexes = require('./validators/indexes')
var json = require('./validators/json')
var slack = require('./validators/slack')
var static = require('./validators/static')
var scheduled = require('./validators/scheduled')
var tables = require('./validators/tables')

/**
 * validates a parsed .arc file
 */
module.exports = function validate(arc, raw, callback) {

  // an array of the validators
  //
  // we'll map over this array applying each validator to the passed in arc object
  //
  // all validator functions below:
  //
  // - accept a parsed arc object and a raw arc file as a string
  // - return an array of error objects
  //
  let validators = [
    app,
    domain,
    events,
    html,
    indexes,
    json,
    scheduled,
    slack,
    static,
    tables,
  ]

  // map function: accepts a validater; applies it to arc
  let validate = validator=> validator(arc, raw)

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
