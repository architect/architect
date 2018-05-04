/* eslint global-require: "off" */
var cookie = require('cookie')
var parse = require('@architect/parser')
var body = require('body-parser')
var fs = require('fs')
var join = require('path').join
var express = require('express')
var cors = require('cors')
var chalk = require('chalk')
var padend = require('lodash.padend')
var local = require('./_local')
var copyShared = require('./_copy-shared')
var copyArc = require('./_copy-arc')

// configure express
var app = express()
app.use(body.json())
app.use(body.urlencoded({extended:false}))
app.use(cors())
app.disable('x-powered-by')

app.start = function _start(callback) {
  app.use(express.static('.views'))
  app.use(express.static('.static'))
  copyShared()
  copyArc()
  registerRoutes('json')
  registerRoutes('html')
  return app.listen(3333, callback)
}

function registerRoutes(type) {

  var arcPath = join(process.cwd(), '.arc')
  var envPath = join(process.cwd(), '.arc-env')

  if (!fs.existsSync(arcPath)) {
    throw Error('.arc file not found in ' + process.cwd())
  }

  var arc = parse(fs.readFileSync(arcPath).toString())
  var env = fs.existsSync(envPath)? parse(fs.readFileSync(envPath).toString()) : false

  if (arc.hasOwnProperty(type)) {
    var routes = arc[type]

    routes.forEach(r=> {

      if (env && env.testing) {
        env.testing.forEach(tuple=> {
          process.env[tuple[0]] = tuple[1]
        })
      }

      var verb = r[0].toLowerCase()
      var route = r[1]
      var path = route === '/'? '-index' : route.replace(/\//g, '-').replace('.', '-').replace(/:/g, '000')
      var funct = require(join(process.cwd(), 'src', type, `${verb}${path}`)).handler
      var left = `@${chalk.dim(type)}${chalk.dim(verb === 'get'? ' get' : verb)}`
      var right = `${padend(chalk.cyan(route), 44, '.')} ${verb}${path}`

      console.log(`${left} ${right}`)

      // actually reg the route
      app[verb](route, function _http(req, res) {
        // api gateway 'Cookie' from express 'cookie'
        req.headers.Cookie = req.headers.cookie

        // run the lambda sig locally
        local(funct, {
          method: verb,
          path: req.path,
          headers: req.headers,
          query: req.query,
          body: req.body,
          params: req.params,
        },
        function _local(err, result) {
          if (err && err.startsWith('/')) {
            res.redirect(err)
          }
          else if (err && type === 'json') {
            var v = JSON.parse(err)
            res.status(v.statusCode).json(typeof v.json === 'string'? JSON.parse(v.json) : v.json)
          }
          else if (err && type === 'html') {
            var v = JSON.parse(err)
            res.set('Content-Type', 'text/html');
            res.status(v.statusCode).end(v.html)
          }
          else if (err) {
            res.status(500).end(err)
          }
          else {
            var arcCookie = cookie.parse(result.cookie)
            res.cookie('_idx', arcCookie._idx, {maxAge:arcCookie['Max-Age'], httpOnly:true})
            if (type === 'json' && result.json) {
              res.json(err? err : result.json)
            }
            else if (type === 'html' && result.html) {
              res.set('Content-Type', 'text/html');
              res.end(err? err : result.html)
            }
          }
        })
      })
    })
  }
}

module.exports = app
