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
  var html = {
    http200: `$input.path('$.html')`,
    http302: `$input.path('$.errorMessage')`,
    http403: vtl, //`not_authorized`,
    http404: vtl, //`not_found`,
    http500: vtl, //`internal_error`,
  }
  var out = ''
  if (statusCode === '200') out = html.http200
  if (statusCode === '302') out = html.http302
  if (statusCode === '403') out = html.http403
  if (statusCode === '404') out = html.http404
  if (statusCode === '500') out = html.http500
  return {
    'text/html': out
  }
}

function _getJSON(statusCode) {
  var json = {
    http403: `#set($inputRoot = $input.path('$'))
{
  "errors" : [{"name":"not_authorized"}]
}`,
    http404: `#set($inputRoot = $input.path('$'))
{
  "errors" : [{"name":"not_found"}]
}`,
    http500: `#set($inputRoot = $input.path('$'))
{
  "errors" : [{"name":"internal_error"}]
}`
  }
  var out = ''
  if (statusCode === '200') out = "$input.json('$.json')"
  if (statusCode === '302') out = "$input.path('$.errorMessage')"
  if (statusCode === '403') out = json.http403
  if (statusCode === '404') out = json.http404
  if (statusCode === '500') out = json.http500
  return {
    'application/json': out
  }
}
