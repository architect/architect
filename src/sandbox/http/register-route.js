let {join} = require('path')
let url = require('url')

let name = require('../../util/get-lambda-name')
let log = require('./pretty-print-route')
let {invokeLambda, LambdaCrashError, LambdaRuntimeError, LambdaTimeoutError} = require('../_invoke-lambda')

module.exports = function reg(app, api, type, routes) {
  if (routes) {
    console.log('')

    // walk all the routes
    routes.forEach(r=> {

      let verb = r[0].toLowerCase()
      let route = r[1]
      let path = name(route)
      let fun = join(type, `${verb}${path}`)

      // pretty print the route reg
      log({verb, route, path})

      // reg the route with the Router instance
      app[verb](route, function _http(req, res, next) {

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
        invokeLambda(fun, request, function _res(err, result) {
          if (err) {
            if (err instanceof LambdaTimeoutError) {
              res.writeHead(503, { 'content-type': 'text/html' })
              res.end(`
                <h1>Timeout Error</h1>
                <p>Lambda <code>${fun}</code> timed out after <b>${err.ttl} seconds</b></p>
              `)
            }
            else if (err instanceof LambdaCrashError) {
              res.writeHead(500, { 'content-type': 'text/html' })
              res.end(`
                <h1>Lambda Crashed</h1>
                <p>${err.message}</p>
                <h3><code>stdout</code></h3>
                <pre>${err.stdout}</pre>
                <h3><code>stderr</code></h3>
                <pre>${err.stderr}</pre>
              `)
            }
            else if (err instanceof LambdaRuntimeError) {
              res.writeHead(500, { 'content-type': 'text/html' })
              res.end(`
                <h1>${err.name}</h1>
                <p>${err.message}</p>
                <pre>${err.stack}</pre>
              `)
            }
            else {
              next(err)
            }
          }
          else if (!result) {
            res.writeHead(500, { 'content-type': 'text/html' })
            res.end(`<h1>Async Error</h1>
              <p>Lambda <code>${fun}</code> ran without executing the completion callback or returning a value.</p>
              
              HTTP Lambda functions that utilize <code>@architect/functions</code> must ensure <code>res</code> gets called.

              <pre>
let arc = require('@architect/functions')

function route(req, res) {
  res({html:'ensure res gets called'})
}

exports.handler = arc.http(route)
              </pre>
              
              Dependency free functions must return an Object with the any of following keys to send an HTTP response:
              <li><code>type</code></li>
              <li><code>body</code></li>
              <li><code>status</code> or <code>code</code></li>
              <li><code>location</code></li>
              <li><code>cookie</code></li>
              <li><code>cors</code></li>
              
            `)
          }
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

            res.end(result.body || '\n')
          }
        })
      })
    })
  }
}
