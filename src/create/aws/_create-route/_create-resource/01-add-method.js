var assert = require('@smallwins/validate/assert')
var unexpress = require('./_un-express-route')
var putMethod = require('./_put-method')

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
      // ignore if this already exists…
      if (err && err.code != 'ConflictException') {
        console.log(err)
      }
      callback(null, resourceId, restApiId)
    })
  }
}
