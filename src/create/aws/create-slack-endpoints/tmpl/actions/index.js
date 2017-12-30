exports.handler = function _action(event, context, callback) {
  console.log(event)
  callback(null, {text:'hi from button press'})
}
