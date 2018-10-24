var assert = require('@smallwins/validate/assert')
var mkdir = require('mkdirp')
var fs = require('fs')
var path = require('path')
var exists = require('path-exists').sync

var docs = fs.readFileSync(path.join(__dirname, '/readme.md')).toString()

module.exports = function create (params, callback) {
  assert(params, {
    app: String
  })

  var _public = path.join(process.cwd(), 'src', 'views')
  var readme = path.join(_public, 'readme.md')

  mkdir(_public, function _done (err) {
    if (err) {
      console.log(err)
    }
    if (!exists(readme)) {
      fs.writeFileSync(readme, docs)
    }
    callback()
  })
}
