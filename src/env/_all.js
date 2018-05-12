let aws = require('aws-sdk')

module.exports = function _all(opts) {
  let ssm = new aws.SSM 
  let query = {
    Path: `/${opts.path}`,
    Recursive: true,
    WithDecryption: true
  }
  if (opts.next) {
    query.NextToken = next
  }
  ssm.getParametersByPath(query, function _query(err, data) {
    if (err) {
      callback(err)
    }
    else {
      callback(null, data)
    }
  })
}
