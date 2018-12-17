// 3rd party
var Router = require('router')
var body = require('body-parser')
var finalhandler = require('finalhandler')

// built ins
var http = require('http2')
var { readFileSync } = require('fs')

// local modules
let readArc = require('../../util/read-arc')
var register = require('./register-route')
var _public = require('./public-middleware')

// config arcana
var limit = '6mb'
var app = Router({mergeparams: true})
app.use(body.json({limit}))
app.use(body.urlencoded({
  extended: false,
  limit
}))
app.use(_public)

// keep a reference up here for fns below
let server

// usr locally generated credentials to support http2 secure server
const cert = readFileSync('./localhost-cert.pem')
const key = readFileSync('./localhost-privkey.pem')
const secureServerOptions = {
  cert,
  key,
  allowHTTP1: true
}
// starts the http server
app.start = function start (callback) {
  // read the arc file
  var web = readArc().arc

  // build the routes
  if (web.http) {
    register(app, '@http', 'http', web.http)
  }

  server = http.createSecureServer(secureServerOptions, function _request (req, res) {
    app(req, res, finalhandler(req, res))
  })

  server.listen(process.env.PORT, callback)

  return app
}

app.close = function close () {
  server.close()
}

// export the app
module.exports = app
