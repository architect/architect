let url = require('url')
let send = require('send')
let path = require('path')
let exists = require('path-exists').sync

/**
 * serves static assets found in /public
 * - if /public/index.html exists it will serve it as / (even if `get /` http lambda is defined)
 */
module.exports = function _public(req, res, next) {

  // assume if public/index.html exists we want to treat that as the app apex
  let legacy = exists(path.join(process.cwd(), 'public', 'index.html'))
  if (legacy) {
    req.url = '/index.html'
  }

  let pathToFile = url.parse(req.url).pathname
  let notFound = !exists(path.join(process.cwd(), 'public', pathToFile))
  if (notFound) {
    next()
  }
  else {
    function error(err) {
      res.statusCode = err.status || 500
      res.end(err.message)
    }

    function redirect() {
      res.statusCode = 301
      res.setHeader('Location', req.url + '/')
      res.end('\n')
    }

    send(req, pathToFile, {root: 'public'})
     .on('error', error)
     .on('directory', redirect)
     .pipe(res)
  }
}
