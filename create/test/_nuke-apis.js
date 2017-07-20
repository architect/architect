var parallel = require('run-parallel')
var aws = require('aws-sdk')
var gateway = new aws.APIGateway

module.exports = function _nukeApis(apis, callback) {
  gateway.getRestApis({}, function _apis(err, result) {
    if (err) {
      callback(err)
    }
    else {
      var ids = result.items.filter(i=> apis.includes(i.name))
      var fns = ids.map(r=> {
        return function _del(callback) {
          setTimeout(function _chill() {
            gateway.deleteRestApi({
              restApiId: r.id
            }, callback)
          }, 1111)
        }
      })
      parallel(fns, callback)
    }
  })
}
