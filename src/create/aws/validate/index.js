var app = require('./_app')
var domain = require('./_domain')
var events = require('./_events')
var html = require('./_html')
var indexes = require('./_indexes')
var json = require('./_json')
var slack = require('./_slack')
var static = require('./_static')
var scheduled = require('./_scheduled')
var tables = require('./_tables')

/**
 * validates a parsed .arc file
 */
module.exports = function validate(arc, callback) {

  // an array of the validators
  //
  // we'll map over this array applying each validator to the passed in arc object
  //
  // all validator functions below:
  //
  // - accept a parsed arc object
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
