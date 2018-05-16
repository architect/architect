let aws = require('aws-sdk')

module.exports = function _all(appname, callback) {
  let ssm = new aws.SSM
  let query = {
    Path: `/${appname}`,
    Recursive: true,
    WithDecryption: true
  }
  ssm.getParametersByPath(query, function _query(err, data) {
    if (err) {
      callback(err)
    }
    else {
      var result = data.Parameters.map(function(param) {
        let bits = param.Name.split('/')
        return {
          app: bits[0],
          env: bits[2],
          name: bits[3],
          value: param.Value,
        }
      })
      callback(null, result)
    }
  })
}
