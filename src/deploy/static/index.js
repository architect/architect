var assert = require('@smallwins/validate/assert')
var mkdir = require('mkdirp').sync
var path = require('path')
var fs = require('fs')
//var waterfall = require('run-waterfall')

module.exports = function deploy(params, callback) {

  assert(params, {
    env: String,
    arc: Object,
    pathToCode: String,
    tick: Function,
  })

  var ignore = !params.arc.static
  if (ignore) {
    callback()
  }
  else {
    // create .static if it does exist
    mkdir(path.join(process.cwd(), '.static'))
    // see if there are files in .static 
    fs.readdir(path, function(err, items) {
      // TODO if not print skipping empty message and exit
      // TODO upload files to approp bucket
      console.log(items);
      for (var i=0; i<items.length; i++) {
        console.log(items[i]);
      }
    })
    callback()
  }
}
