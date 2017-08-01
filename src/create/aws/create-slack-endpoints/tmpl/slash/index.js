exports.handler = function _event(event, context, callback) {
  console.log('recieved event')
  console.log(JSON.stringify(event, null, 2))
  callback()
}


