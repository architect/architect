let aws = require('aws-sdk')

module.exports = function _all(appname, env, callback) {
  let ssm = new aws.SSM({region: process.env.AWS_REGION})
  let query = {
    Path: `/${appname}/${env}`,
    Recursive: true,
    WithDecryption: true
  }
  /*
  if (opts.next) {
    query.NextToken = opts.next
  }*/
  ssm.getParametersByPath(query, function _query(err, data) {
    if (err) {
      callback(err)
    }
    else {
      var result = data.Parameters.map(function(param) {
        let bits = param.Name.split('/')
        return {
          env: bits[2],
          name: bits[3],
          value: param.Value,
        }
      })
      callback(null, result)

    }
  })
}
