var fs = require('fs')
var path = require('path')

module.exports = function _getResponseTemplates(statusCode, type) {
  var isHTML = type === 'html'
  return isHTML? _getHTML(statusCode) : _getJSON(statusCode)
}

/* usage! loooool
callback(Error(JSON.stringify({
  html: '<blink>internal "server" error</blink>',
  statusCode: 500
}))) */

function _getHTML(statusCode) {
  var vtl = fs.readFileSync(path.join(__dirname, '_errors-html.vtl')).toString()
  var out = ''
  if (statusCode === '200') out = `$input.path('$.html')`
  if (statusCode === '302') out = `$input.path('$.errorMessage')`
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'text/html': out
  }
}

function _getJSON(statusCode) {
  var vtl = fs.readFileSync(path.join(__dirname, '_errors-json.vtl')).toString()
  var out = ''
  if (statusCode === '200') out = "$input.json('$.json')"
  if (statusCode === '302') out = "$input.path('$.errorMessage')"
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'application/json': out
  }
}
