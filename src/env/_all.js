let aws = require('aws-sdk')

module.exports = function _all(opts, callback) {
  let ssm = new aws.SSM
  let query = {
    Path: `/${opts.path}`,
    Recursive: true,
    WithDecryption: true
  }
  if (opts.next) {
    query.NextToken = opts.next
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
