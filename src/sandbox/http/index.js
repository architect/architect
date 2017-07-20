var waterfall = require('run-waterfall')
var cookie = require('cookie')
var parse = require('@smallwins/arc-parser')
var body = require('body-parser')
var fs = require('fs')
var join = require('path').join
var express = require('express')
var chalk = require('chalk')
var padend = require('lodash.padend')
var local = require('./_local')

// configure express
var app = express()
app.use(body.json())
app.use(body.urlencoded({extended:false}))

app.start = function _start(callback) {
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
      var path = route === '/'? '-index' : route.replace(/\//g, '-').replace(/:/g, '000')
      var funct = require(join(process.cwd(), 'src', type, `${verb}${path}`)).handler

      console.log(`@${chalk.dim(type)}${chalk.dim(verb === 'get'? ' get' : verb)} ${padend(chalk.cyan(route), 44, '.')} ${verb}${path}`)

      // actually reg the route
      app[verb](route, function _http(req, res) {
        // api gateway 'Cookie' from express 'cookie'
        req.headers.Cookie = req.headers.cookie
        // run the lambda sig locally
        local(funct, {
          method: verb,
          path: route,
          headers: req.headers,
          query: req.query,
          body: req.body,
          params: req.params,
        },
        function _local(err, result) {
          // res.setHeader('Set-Cookie', result.cookie)
          var arcCookie = cookie.parse(result.cookie)
          res.cookie('_idx', arcCookie._idx, {maxAge:arcCookie['Max-Age'], httpOnly:true})
          if (type === 'json' && result.json) {
            res.json(err? err : result.json)
          }
          else if (type === 'html' && result.html) {
            res.set('Content-Type', 'text/html');
            res.end(err? err : result.html)
          }
        })
      })
    })
  }
}

module.exports = app
