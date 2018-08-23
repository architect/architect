let readArc = require('../../util/read-arc')
let url = require('url')
let send = require('send')
let exists = require('path-exists').sync
let path = require('path')

module.exports = function static(req, res, next) {

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

  // parse .arc
  let {arc} = readArc()

  let noFile = !allowed.includes(last)
  let noStatic = !exists(path.join(process.cwd(), '.static'))
  let notInterested = (last === 'js' && arc.hasOwnProperty('js')) || (last === 'css' && arc.hasOwnProperty('css'))

  if (noFile) {
    // only allowed file types
    next()
  }
  else if (noStatic) {
    // if there's no static skip
    next()
  }
  else if (notInterested) {
    // js or css are defined in .arc so skip
    next()
  }
  else {
    function error (err) {
      res.statusCode = err.status || 500
      res.end(err.message)
    }

    // custom headers
    function headers (/*res, path, stat*/) {
      // serve all files for download
      //res.setHeader('Content-Disposition', 'attachment')
    }

    // custom directory handling logic
    function redirect () {
      res.statusCode = 301
      res.setHeader('Location', req.url + '/')
      res.end('\n')
    }

   send(req, pathToFile, {root: '.static'})
   .on('error', error)
   .on('directory', redirect)
   .on('headers', headers)
   .pipe(res)
  }
}
