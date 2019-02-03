let aws = require('aws-sdk')
let parallel = require('run-parallel')

module.exports = function reads({app, env, arc}, callback) {

  let region = process.env.AWS_REGION
  let api = new aws.APIGateway({region})

  parallel({
    // read the restApiId
    restApiId(callback) {
      api.getRestApis({
        limit: 500
      },
      function getRestApis(err, apis) {
        if (err) callback(err)
        else {
          let byName = i=> i.name === `${app}-${env}`
          let api = apis.items.find(byName)
          callback(null, api.id)
        }
      })
    },
    // read the s3 bucket arn
    endpoint(callback) {
      let isOGS3 = region === 'us-east-1'
      let domain = isOGS3 ? `https://s3.amazonaws.com/` : `https://s3-${region}.amazonaws.com/`
      let bucket = getBucket(env, arc.static)
      callback(null, `${domain}${bucket}`)
    }
  }, callback)
}


// helper returns the @static value for the current NODE_ENV
function getBucket(env, static) {
  let staging
  let production
  static.forEach(thing=> {
    if (thing[0] === 'staging') {
      staging = thing[1]
    }
    if (thing[0] === 'production') {
      production = thing[1]
    }
  })
  if (env === 'staging')
    return staging
  if (env === 'production')
    return production
}
