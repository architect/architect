// 3rd party
var Router = require('router')
var body = require('body-parser')
var finalhandler = require('finalhandler')

// built ins
var http = require('http')

// local modules
let readArc = require('../../util/read-arc')
var register = require('./register-route')
var public = require('./public-middleware')

// config arcana
var limit = '6mb';
var app = Router({mergeparams: true})
app.use(body.json({limit}))
app.use(body.urlencoded({
  extended: false,
  limit,
}))
app.use(public)

// keep a reference up here for fns below
let server

// starts the http server
app.start = function start(callback) {

  // read the arc file
  var web = readArc().arc

  // build the routes
  if (web.http) {
    register(app, '@http', 'http', web.http)
  }

  // create an actual server; how quaint!
  server = http.createServer(function _request(req, res) {
    app(req, res, finalhandler(req, res))
  })

  server.listen(process.env.PORT, callback)

  return app
}

app.close = function close() {
  server.close()
}

// export the app
module.exports = app
