var msg = require('./_messages').success

module.exports = function _success(app, domain, callback) {
  msg(domain)
  callback()
}
