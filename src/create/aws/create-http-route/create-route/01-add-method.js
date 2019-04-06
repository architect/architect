let aws = require('aws-sdk')
let assert = require('@smallwins/validate/assert')
let unexpress = require('./_un-express-route')

function putMethod(params, callback) {
  setTimeout(function _latency() {
    let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
    gateway.putMethod(params, callback)
  }, 1111)
}

module.exports = function _01addMethod(params, callback) {

  assert(params, {
    route: String,
    httpMethod: String,
    restApiId: String,
    resources: Object,
  })

  var {route, httpMethod, restApiId, resources} = params
  var resource = resources.items.find(r=> r.path === unexpress(route))
  var resourceId = resource.id // used below (declared above!)
  var exists = resource.resourceMethods && resource.resourceMethods.hasOwnProperty(httpMethod)
  if (exists) {
    callback(null, resourceId, restApiId)
  }
  else {
    // put the http method if it isn't there
    putMethod({
      authorizationType: 'NONE',
      httpMethod: httpMethod.toUpperCase(),
      resourceId,
      restApiId,
    },
    function _putMethod(err) {
      if (err && err.code === 'ConflictException') {
        // ignore if this already exists…
        callback(null, resourceId, restApiId)
      }
      else if (err) {
        // surface any errors
        callback(err)
      }
      else {
        callback(null, resourceId, restApiId)
      }
    })
  }
}
