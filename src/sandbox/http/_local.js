/**
 * mocks a lambda.. not much to it eh!
 */
module.exports = function local(fn, event, callback) {
  var context = {
    succeed(x) {
      callback(null, x)
    },
    fail(x) {
      callback(x)
    }
  }
  if (fn.constructor.name === 'AsyncFunction') {
    //console.log('called async')
    fn(event, context, callback).then(function win(result) {
      callback(null, result)
    }).catch(callback)
  }
  else {
    //console.log('called not async', fn.constructor.name)
    fn(event, context, callback)
  }
}
