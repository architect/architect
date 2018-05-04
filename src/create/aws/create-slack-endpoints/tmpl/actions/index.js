exports.handler = function actions(event, context, callback) {
  console.log(JSON.stringify(event, null, 2))
  callback(null, {text:'hi from button press'})
}
