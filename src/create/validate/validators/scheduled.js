let regexp = require('../_regexp')
let Err = require('../_error-factory')

// must consult charts
module.exports = function scheduled(arc, raw) {
  var errors = []
  if (arc.scheduled) {
    // TODO validate all scheduled expression names are unique
    arc.scheduled.forEach(expression=> {
      if (Array.isArray(expression)) {
        var copy = expression.slice(0)
        var copy2 = expression.slice(0)
        var expressionName = copy2.shift()
        var expressionValue = copy2.join(' ')
        if (expressionName.length > 35) {
          errors.push(Err({
            message: `@scheduled ${expressionName} > 35 characters`,
            linenumber: findLineNumber(copy.join(' '), raw),
            raw,
            arc,
            detail: 'Scheduled function expression names must be 35 characters or less.',
          }))
        }
        if (!regexp.schedulename.test(expressionName)) {
          errors.push(Err({
            message: `@scheduled ${expressionName} contains invalid characters`,
            linenumber: findLineNumber(copy.join(' '), raw),
            raw,
            arc,
            detail: 'Scheduled function expression names must be lowercase, alphanumeric, dasherized and start with a letter.',
          }))
        }
        // validate the rate() or cron() expression
        var url = 'https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html'
        var isRate = regexp.rate.test(expressionValue)
        var isCron = regexp.cron.test(expressionValue)
        var isNotEither = isRate === false && isCron === false
        if (isNotEither) {
          errors.push(Err({
            message: `@scheduled invalid expression`,
            linenumber: findLineNumber(copy.join(' '), raw),
            raw,
            arc,
            detail: `Scheduled function expressions must be either rate() or cron(). See: ${url}`,
          }))
        }
        if (isRate) {
          // todo validate rates
          var guts = expressionValue.match(regexp.rate)[1]
          var parts = guts.split(' ')
          var left = parts[0]
          var right = parts[1]
          var isSingular = left === '1'
          if (isSingular) {
            var plural = right.split('').reverse()[0] === 's'
            if (plural) {
              errors.push(Err({
                message: `@scheduled expression plural for singular value`,
                linenumber: findLineNumber(copy.join(' '), raw),
                raw,
                arc,
                detail: `Scheduled function expressions cannot be plural for singular values. See: ${url}`,
              }))
            }
          }
          var validExpression = regexp.rateExp.test(guts)
          if (!validExpression) {
            //var msg = `@scheduled rate expression: ${guts} is invalid. See: ${url}`
            //errors.push(Error(msg))
              errors.push(Err({
                message: `@scheduled expression invalid`,
                linenumber: findLineNumber(copy.join(' '), raw),
                raw,
                arc,
                detail: `Scheduled function reference: ${url}`,
              }))
          }
        }
        if (isCron) {
          var guts = expressionValue.match(regexp.cron)[1]
          let spilled = guts.split(' ')
          let hasSix = spilled.length === 6
          if (!hasSix) {
            errors.push(Err({
              message: `@scheduled cron() expression must have six values (found ${spilled.length})`,
              linenumber: findLineNumber(copy.join(' '), raw),
              raw,
              arc,
              detail: `Scheduled function reference: https://arc.codes/reference/scheduled`,
            }))
          }
        }
      }
      else {
        // errors.push(Error(`@scheduled invalid expression`))
        errors.push(Err({
          message: `@scheduled section values invalid`,
          linenumber: findLineNumber(copy.join(' '), raw),
          raw,
          arc,
          detail: `Scheduled function reference: https://arc.codes/reference/scheduled`,
        }))
      }
    })
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
