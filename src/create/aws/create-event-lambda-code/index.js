var assert = require('@smallwins/validate/assert')
var path = require('path')
var mkdir = require('mkdirp').sync
var exec = require('child_process').exec
var fs = require('fs')
var cp = require('cp').sync
var print = require('../../_print')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    event: String,
    app: String,
  })

  // non destructive setup dir
  mkdir('src')
  mkdir('src/events')

  var p = path.join(process.cwd(), 'src', 'events', params.event)
  if (fs.existsSync(p)) {
    // skip if that dir exists
    // console.log(`skip: ${p} exists`)
    print.skip('@events', `src/events/${params.event}`)
    callback()
  }
  else {
    var lambda = `src/events/${params.event}`
    print.create('@events', lambda)
    mkdir(lambda)

    // write package.json
    var pathToPkg = path.join('src', 'events', params.event, 'package.json')
    var pkg = {
      name: `${params.app}-${params.event}`
    }
    fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))

    // copy in index.js
    var index = path.join(__dirname, '..', '..', 'templates', 'sns-lambda', 'index.js')
    cp(index, path.join('src', 'events', params.event, 'index.js'))

    // npm i latest deps in the hello world template
    var pathToTmpl = path.join('src', 'events', params.event)

    exec(`
      cd ${pathToTmpl} && \
      npm i @architect/functions --save --production
    `,
    function _exec(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
}
