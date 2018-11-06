let url = require('url')
let send = require('send')
let exists = require('path-exists').sync
let path = require('path')

module.exports = function _public (req, res, next) {
  /**
   * technically, any file extension could work here, but in order to prevent route collisions, we're capturing based on extension
      sandbox also ignores js and css if you happen to be using js or arc routes (also in service of collision prevension)
      note: what can be previewed in sandbox is a separate concern from what can be deployed to s3 with arc, where there are (as of this writing) no filetype limitations
   */
  // get the file exension
  let allowed = [
    // images
    'bmp', 'gif', 'jif', 'ico', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff', 'webp',
    // compiled web stuff
    'css', 'htm', 'html', 'js', 'json', 'mjs', 'ts',
    // binaries + archives
    'bz', 'bz2', 'dmg', 'gz', 'jar', 'tar', 'zip'
  ]
  let pathToFile = url.parse(req.url).pathname
  let bits = pathToFile.split('.')
  let last = bits[bits.length - 1] // the file extension
  let noFile = !allowed.includes(last)
  let noPublic = !exists(path.join(process.cwd(), 'public'))
  let notInterested = !exists(path.join(process.cwd(), 'public', pathToFile))

  if (noFile) {
    // only allowed file types
    next()
  } else if (noPublic) {
    // if there's no public skip
    next()
  } else if (notInterested) {
    // js or css are defined in .arc so skip
    next()
  } else {
    send(req, pathToFile, {root: 'public'})
     .on('error', error)
     .on('directory', redirect)
     .pipe(res)
  }

  function error (err) {
    res.statusCode = err.status || 500
    res.end(err.message)
  }

  function redirect () {
    res.statusCode = 301
    res.setHeader('Location', req.url + '/')
    res.end('\n')
  }
}
