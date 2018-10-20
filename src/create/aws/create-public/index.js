var assert = require('@smallwins/validate/assert')
var mkdir = require('mkdirp')
var fs = require('fs')
var path = require('path')
var exists = require('path-exists').sync

var docs = `# Automagic \`public\` directory

The contents of this folder get copied to s3 buckets defined in the \`@static\` pragma of your .arc file.

Contents get copied when you run \`npm run deploy\`.

## Use Caution!

All contents of public will be copied to s3 on each deploy. This will overwrite the existing files in s3 of the same name.

In the case where two resources have identical urls the public asset will take precedence.
`

module.exports = function create (params, callback) {
  assert(params, {
    app: String
  })

  var _public = path.join(process.cwd(), 'public')
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
