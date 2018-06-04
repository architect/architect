var regexp = require('../_regexp')

// TODO we may want to look at consolidating some of this logic with events
// lodash alpha numeric, dashes between one and 50 chars
module.exports = function slack(arc/*, raw*/) {
  var errors = []
  if (arc.slack) {
    var isNotString = v=> typeof v != 'string'
    var typesOk = Array.isArray(arc.slack) && arc.slack.filter(isNotString).length === 0
    if (!typesOk) {
      errors.push(Error(`@slack invalid`))
    }
    else {
      arc.slack.forEach(bot=> {
        if (bot.length > 50) {
          errors.push(Error(`@slack ${bot} greater than 50 characters (it is ${bot.length}!)`))
        }
        if (!regexp.slackname.test(bot)) {
          errors.push(Error(`@slack ${bot} invalid characters (must be lowercase, alphanumeric, dashes)`))
        }
      })
    }
  }
  return errors
}
