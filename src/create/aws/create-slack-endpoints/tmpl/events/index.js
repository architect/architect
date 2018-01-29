exports.handler = function events(event, context, callback) {
  console.log(JSON.stringify(event, null, 2))
  var isChallenging = event.type === "url_verification" && event.hasOwnProperty('challenge')
  if (isChallenging) {
    callback(null, {challenge: event.challenge})
  }
  else {
    callback()
  }
}
