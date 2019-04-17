// solve and create all our problems in one place (!)
module.exports = {
  appname: /^[a-z][a-z|\-|0-9]+/,      // lowercase alphanumeric dasherized (must start with a letter)
  eventname: /^[a-z][a-z|\-|0-9]+/,    // lowercase alphanumeric dasherized (must start with a letter)
  // aws
  layer: /arn:(aws[a-zA-Z-]*)?:lambda:[a-z]{2}((-gov)|(-iso(b?)))?-[a-z]+-\d{1}:\d{12}:layer:[a-zA-Z0-9-_]+(:(\$LATEST|[a-zA-Z0-9-_]+))?/,
  // http                              // see: ./_valid-path.js
  // TODO queues
  schedulename: /^[a-z][a-z|\-|0-9]+/, // lowercase alphanumeric dasherized (must start with a letter)
  slackname: /^[a-z][a-z|\-|0-9]+/,    // lowercase alphanumeric dasherized (must start with a letter)
  // TODO static
  tablename: /^[a-z][a-z|\-|0-9]+/,    // lowercase alphanumeric dasherized (must start with a letter)
  rate: /rate\((.+)\)/,                // "rate(1 minute)".match(regexp.rate) returns ['rate(1 minutes)', '1 minutes']
  cron: /cron\((.+)\)/,                // "cron(* * ? * * *)".match(regexp.cron) returns ['cron(* * ? * * *)', '* * ? * * *']
  rateExp: /^\d+ (minute(s)?|hour(s)?|day(s)?)/,
  cronExp: /a/,
}
