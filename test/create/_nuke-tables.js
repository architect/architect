var parallel = require('run-parallel')
var aws = require('aws-sdk')
var db = new aws.DynamoDB

module.exports = function _nukeTables(tables, callback) {
  var fns = tables.map(t=> {
    return function _del(callback) {
      function deleter() {
        db.deleteTable({TableName:t}, function (err) {
          if (err && err.name === 'ResourceInUseException') {
            setTimeout(function _retry() {
              console.log('retrying!')
              deleter()
            }, 6666)
          }
          else {
            callback()
          }
        })
      }
      deleter()
    }
  })
  parallel(fns, callback)
}
