// 3rd party
let Router = require('router')
let body = require('body-parser')
let finalhandler = require('finalhandler')

// built ins
let http = require('http')

// local modules
let readArc = require('../../util/read-arc')
let registerHTTP = require('./register-http')
let registerWS = require('./register-websocket')
let binary = require('./binary-handler')
let public = require('./public-middleware')
let fallback = require('./fallback')

// config arcana
let jsonTypes = /^application\/.*json/
let limit = '6mb';
let app = Router({mergeParams: true})
app.use(binary)
app.use(body.json({
  limit,
  type: req => jsonTypes.test(req.headers['content-type'])
}))
app.use(body.urlencoded({
  extended: false,
  limit,
}))

app.use(public)
app.use(fallback)

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    app(req, res, finalhandler(req, res))
  })

  // bind ws
  if (web.ws) {
    websocket = registerWS({app, server})
  }

  // start listening
  server.listen(process.env.PORT, callback)
  return app
}

app.close = function close() {
  server.close()
  if (websocket)
    websocket.close()
}

// export the app
module.exports = app
