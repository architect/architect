let fs = require('fs')
let url = require('url')
let send = require('send')
let path = require('path')
let exists = require('path-exists').sync

/**
 * serves static assets found in ./public/static at http://localhost:3333/static/
 */
module.exports = function _public(req, res, next) {
  let isAsset = req.url.startsWith('/static')
  if (!isAsset) {
    next()
  }
  else {
    let pathToFile = url.parse(req.url).pathname
    let fullPath = path.join(process.cwd(), 'public', pathToFile)
    let found = exists(fullPath) && fs.statSync(fullPath).isFile()
    if (!found) {
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
}
