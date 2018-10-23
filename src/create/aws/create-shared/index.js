var assert = require('@smallwins/validate/assert')
var mkdir = require('mkdirp')
var fs = require('fs')
var path = require('path')
var exists = require('path-exists').sync

var docs = fs.readFileSync(path.join(__dirname, '/readme.md')).toString()

module.exports = function create(params, callback) {
  assert(params, {
    app: String,
  })

  var _shared = path.join(process.cwd(), 'src', 'shared')
  var readme = path.join(_shared, 'readme.md')

  mkdir(_shared, function _done(err) {
    if (err) {
      console.log(err)
    }
    if (!exists(readme)) {
      fs.writeFileSync(readme, docs)
    }
    callback()
  })
}
