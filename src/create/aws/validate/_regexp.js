// solve and create all our problems in one place (!)
module.exports = {
  appname: /^[a-z][a-z|\-|0-9]+/,      // lowercase alphanumeric dasherized (must start with a letter)
  eventname: /^[a-z][a-z|\-|0-9]+/,    // lowercase alphanumeric dasherized (must start with a letter)
  slackname: /^[a-z][a-z|\-|0-9]+/,    // lowercase alphanumeric dasherized (must start with a letter)
  schedulename: /^[a-z][a-z|\-|0-9]+/, // lowercase alphanumeric dasherized (must start with a letter)
  tablename: /^[a-z][a-z|\-|0-9]+/,    // lowercase alphanumeric dasherized (must start with a letter)
  rate: /rate\((.+)\)/,                // "rate(1 minute)".match(regexp.rate) returns ['rate(1 minutes)', '1 minutes']
  cron: /cron\((.+)\)/,                // "cron(* * ? * * *)".match(regexp.cron) returns ['cron(* * ? * * *)', '* * ? * * *']
  rateExp: /^\d+ (minute(s)?|hour(s)?|day(s)?)/,
  cronExp: /a/,
}
