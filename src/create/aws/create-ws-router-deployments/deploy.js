let aws = require('aws-sdk')
let waterfall = require('run-waterfall')

module.exports = function deploy(api, callback) {
  let region = process.env.AWS_REGION
  let gateway = new aws.ApiGatewayV2({region})
  let ApiId = api.ApiId
  let StageName = api.Name.includes('staging')? 'staging' : 'production'
  waterfall([
    function createDeployment(callback) {
      gateway.createDeployment({
        ApiId,
      }, callback)
    },
    function createStage({DeploymentId}, callback) {
      gateway.updateStage({
        ApiId,
        StageName,
        DeploymentId,
      },
      function updateStage(err) {
        if (err && err.code === 'NotFoundException') {
          gateway.createStage({
            ApiId,
            StageName,
            DeploymentId,
          }, callback)
        }
        else if (err) callback(err)
        else callback()
      })
    },
  ],
  function done(err) {
    if (err) console.log(err)
    callback(null, ApiId)
  })
}
