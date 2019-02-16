//let fs = require('fs')
//let url = require('url')
//let send = require('send')
//let exists = require('path-exists').sync
let path = require('path')
let parseUrl = require('url').parse
let readArc = require('../../util/read-arc')
let invoker = require('./invoke-http')

/**
 * serves static assets found in /public
 * - if /public/index.html exists it will serve it as /
 *   (even if `get /` http lambda is defined)
 */
module.exports = function _public(req, res, next) {
  // immediately exit to normal flow if /
  if (req.path === '/') next()
  else {
    // reads all routes
    let routes = readArc().arc.http
    // tokenize them [['get', '/']]
    let tokens = routes.map(r=> [r[0]].concat(r[1].split('/').filter(Boolean)))
    // tokenize the current req
    let {pathname} = parseUrl(req.url)
    let current = [req.method.toLowerCase()].concat(pathname.split('/').filter(Boolean))
    // get all exact match routes
    let exact = tokens.filter(t=> !t.some(v=> v.startsWith(':')))
    // get all wildcard routes
    let wild = tokens.filter(t=> t.some(v=> v.startsWith(':')))
    // look for an exact match
    let exactMatch = exact.some(t=> t.join('') === current.join(''))
    // look for a wildcard match
    let wildMatch = wild.filter(t=> t.length === current.length).some(t=> {
      // turn :foo tokens into (\S+) regexp
      let exp = t.map(p=> p.startsWith(':')? '(\\S+)' : p).join('/')
      let reg = new RegExp(exp)
      return reg.test(current.join('/'))
    })
    // if either exact or wildcard match bail
    let match = exactMatch || wildMatch
    if (match) {
      next()
    }
    else {
      // invoke the get-index lambda function with a proxy payload
      let exec = invoker({
        verb: req.method.toLowerCase(),
        pathToFunction: path.join(process.cwd(), 'src', 'http', `get-index`)
      })
      // TODO mock a {proxy+} request payload
      req.requestContext = {}
      exec(req, res)
    }
  }
}
