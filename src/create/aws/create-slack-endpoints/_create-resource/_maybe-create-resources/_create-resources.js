var waterfall = require('run-waterfall')
var createResource = require('./_create-resource')
var getParentID = require('./_get-parent-id')
var getPathPart = require('./_get-path-part')
var urlParts = require('./_url-parts')
var unexpress = require('../_un-express-route')
var getResources = require('../_get-resources')
var print = require('../../../../_print')

module.exports = function _createResources(restApiId, route, type, callback) {

  var allRoutes = urlParts(route)

  var routes = allRoutes.map(part=> {
    return function _skipOrCreate(callback) {
      waterfall([
        function _getResources(callback) {
          getResources({restApiId}, callback)
        },
        function _maybeCreate(resources, callback) {
          var rpath = unexpress(part)
          var found = resources.items.find(r=> r.path === rpath)
          if (found) {
            print.skip(`@${type}`, route)
            callback()
          }
          else {
            print.create(`@${type}`, route)
            var parentId = getParentID(part, resources)
            var pathPart = getPathPart(part)

            createResource({
              parentId,
              pathPart,
              restApiId,
            },
            function _create(err) {
              if (err && err.name != 'ConflictException') {
                console.log(err)
              }
              callback()
            })
          }
        }
      ], callback)
    }
  })
  // walk the routes in series
  waterfall(routes, callback)
}
