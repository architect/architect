var series = require('run-waterfall')
var path = require('path')
var zipit = require('zipit')
var glob = require('glob')
var zipdir = require('zip-dir')

module.exports = function zipper(pathIn, callback) {
  let zip = process.platform.startsWith('win')? winzip : nixzip
  zip(pathIn, callback)
}

function winzip(pathToCode, callback) {
  zipdir(pathToCode, callback)
}

function nixzip(pathToCode, callback) {
  series([
    // get a handle on the files to zip
    function _read(callback) {
      glob(path.join(process.cwd(), pathToCode, '/*'), callback)
    },
    function _zip(files, callback) {
      zipit({
        input: files,
      }, callback)
    },
  ], callback)
}