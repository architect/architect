let {join} = require('path')
let url = require('url')

let name = require('../../util/get-lambda-name')
let log = require('./pretty-print-route')
let invoke = require('./invoke-lambda')

module.exports = function reg(app, api, type, routes) {
  if (routes) {
    console.log('')

    // walk all the routes
    routes.forEach(r=> {

      let verb = r[0].toLowerCase()
      let route = r[1]
      let path = name(route)
      let fun = join(process.cwd(), 'src', type, `${verb}${path}`)

      // pretty print the route reg
      log({verb, route, path})

      // reg the route with the Router instance
      app[verb](route, function _http(req, res) {

        // HACK api gateway 'Cookie' from express 'cookie'
        req.headers.Cookie = req.headers.cookie
        delete req.headers.cookie

        let request = {
          method: verb,
          path: url.parse(req.url).pathname,
          headers: req.headers,
          query: url.parse(req.url, true).query,
          body: req.body,
          params: req.params,
        }

        // run the lambda sig locally
        invoke(fun, request, function _res(err, result) {
          if (err) res(err)
          else {
            res.setHeader('Content-Type', result.type || 'application/json; charset=utf-8')
            res.statusCode = result.status || result.code || 200

            // remove Secure because localhost won't be SSL (and the cookie won't get set)
            if (result.cookie)
              res.setHeader('Set-Cookie', result.cookie.replace('; Secure', '; Path=/'))

            if (result.location)
              res.setHeader('Location', result.location)

            if (result.cors)
              res.setHeader('Access-Control-Allow-Origin', '*')

            // Re-encode nested JSON responses
            if (typeof result.json !== 'undefined')
              result.body = JSON.stringify(result.body)

            res.end(result.body || '\n')
          }
        })
      })
    })
  }
}
