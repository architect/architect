// 3rd party
var Router = require('router')
var body = require('body-parser')
var finalhandler = require('finalhandler')

// built ins
var http = require('http')

// local modules
let readArc = require('../../util/read-arc')
var regHTTP = require('./_register-http-route')
var _public = require('./_public')
var _env = require('../env')

// config arcana
var app = Router({mergeparams: true})
app.use(body.json())
app.use(body.urlencoded({extended: false}))
app.use(_public)

// keep a reference up here for fns below
let server

// starts the http server
app.start = function start (callback) {
  _env(function (err) {
    if (err) {
      throw err
    }
  })
  // read the arc file
  var web = readArc().arc

  // build the routes
  if (web.http) {
    regHTTP(app, '@http', 'http', web.http)
  }

  // create an actual server; how quaint!
  server = http.createServer(function _request (req, res) {
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
