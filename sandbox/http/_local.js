module.exports = function local(fn, event, callback) {
  var context = {
    succeed(x) {
      callback(null, x)
    },
    fail(x) {
      callback(x)
    }
  }
  fn(event, context, callback)
}

