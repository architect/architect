exports.handler = function slash(event, context, callback) {
  console.log(JSON.stringify(event, null, 2))
  callback(null, {text:'hi from slash'})
}
