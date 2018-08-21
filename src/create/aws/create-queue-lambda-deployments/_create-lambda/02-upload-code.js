let aws = require('aws-sdk')

module.exports = function _createFunc({app, queue, name}, zip, role, callback) {
  let lambda = new aws.Lambda
  lambda.createFunction({
    Code: {
      ZipFile: zip
    },
    Description: `@queue ${queue}`,
    FunctionName: name,
    Handler: 'index.handler',
    MemorySize: 1152,
    Publish: true,
    Role: role.Arn,
    Runtime: 'nodejs8.10',
    Timeout: 5,
    Environment: {
      Variables: {
        'NODE_ENV': name.includes('staging')? 'staging' : 'production',
        'ARC_APP_NAME': app,
      }
    }
  },
  function _createFn(err) {
    if (err && err.name != 'ResourceConflictException') {
      console.log(err)
      callback(err)
    }
    else if (err && err.name == 'ResourceConflictException') {
      callback(null, name)
    }
    else {
      callback(null, name)
    }
  })
}
