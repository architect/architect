var local = require('./_local')
var getPath = require('./_get-path')
var getFunction = require('./_get-fn')
var url = require('url')
var response = require('./_response')
var log = require('./_log')
var chalk = require('chalk')

module.exports = function reg(app, api, type, routes) {
  if (routes) {
    console.log('\n', chalk.green(api))

    // walk all the routes
    routes.forEach(r=> {

      var verb = r[0].toLowerCase()
      var route = r[1]
      var path = getPath(route)
      var funct = getFunction(api, type, verb, path)

      // pretty print the route reg
      log({verb, route, path})

      // reg the route with the Router instance
      app[verb](route, function _http(req, res) {

        // api gateway 'Cookie' from express 'cookie'
        req.headers.Cookie = req.headers.cookie

        // run the lambda sig locally
        local(funct, {
          method: verb,
          path: url.parse(req.url).pathname,
          headers: req.headers,
          query: url.parse(req.url, true).query,
          body: req.body,
          params: req.params,
        }, response(type, res))
      })
    })
  }
}
