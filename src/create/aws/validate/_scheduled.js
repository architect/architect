var regexp = require('./_regexp')

// must consult charts
module.exports = function scheduled(arc) {
  var errors = []
  if (arc.scheduled) {
    // TODO validate all scheduled expression names are unique
    arc.scheduled.forEach(expression=> {
      if (Array.isArray(expression)) {
        var expressionName = expression.shift()
        var expressionValue = expression.join(' ')
        if (expressionName.length > 20) {
          var msg = `@scheduled name ${expressionName} too long (must be less than 20 characters)`
          errors.push(Error(msg))
        }
        if (!regexp.schedulename.test(expressionName)) {
          var msg = `@scheduled name ${expressionName} invalid (must be lowercase, alphanumeric, dashes)`
          errors.push(Error(msg))
        }
        // validate the rate() or cron() expression
        var url = 'https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html'
        var isRate = regexp.rate.test(expressionValue)
        var isCron = regexp.cron.test(expressionValue)
        var isNotEither = isRate === false && isCron === false
        if (isNotEither) {
          var msg = `@scheduled expression ${expressionValue} invalid; must be either rate() or cron(). See: ${url}`
          errors.push(Error(msg))
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
              var msg = `@scheduled rate expression invalid; ${expressionName} ${expressionValue} should not be plural. See: ${url}`
              errors.push(Error(msg))
            }
          }
          var validExpression = regexp.rateExp.test(guts)
          if (!validExpression) {
            var msg = `@scheduled rate expression: ${guts} is invalid. See: ${url}`
            errors.push(Error(msg))
          }
        }
        if (isCron) {
          var guts = expressionValue.match(regexp.cron)[1]
          // TODO validate the guts of cron() expressions
        }
      }
      else {
        errors.push(Error(`@scheduled invalid expression`))
      }
    })
  }
  return errors
}
