// 3rd party
let Router = require('router')
let body = require('body-parser')
let finalhandler = require('finalhandler')

// built ins
let http = require('http')
let cors = require('cors')

// local modules
let readArc = require('../../util/read-arc')
let registerHTTP = require('./register-http')
let registerWebSocket = require('./register-websocket')
let public = require('./public-middleware')

// config arcana
let limit = '6mb';
let app = Router({mergeparams: true})
app.use(cors())
app.use(body.json({limit}))
app.use(body.urlencoded({
  extended: false,
  limit,
}))
app.use(public)

// keep a reference up here for fns below
let server
let websocket

// starts the http server
app.start = function start(callback) {

  // read the arc file
  var web = readArc().arc

  // build the routes
  if (web.http) {
    registerHTTP(app, '@http', 'http', web.http)
  }

  // create an actual server; how quaint!
  server = http.createServer(function _request(req, res) {
    app(req, res, finalhandler(req, res))
  })

  // bind ws
  if (web.ws) {
    websocket = registerWebSocket({app, server})
  }

  // start listening
  server.listen(process.env.PORT, callback)
  return app
}

app.close = function close() {
  server.close()
  websocket.close()
}

// export the app
module.exports = app
