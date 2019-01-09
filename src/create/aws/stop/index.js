let stop = require('../../_print').stop
module.exports = function(params, callback) {
  stop() 
  callback()
}
