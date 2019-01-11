let fs = require('fs')
let path = require('path')

/**
 * vtl is just wow
 * this helper sets up the integration response expecting a key for the content type
 * if it does not find that key it looks for errorMessage and displays that as a fallback
 */
function ok(type) {
  if (type === 'json') {
    return `#if($input.json('$.${type}'))
$input.json('$.${type}')
#end

#if($input.path('$.errorMessage'))
$input.path('$.errorMessage')
#end`
  }
  else {
    return `#if($input.path('$.${type}'))
$input.path('$.${type}')
#end

#if($input.path('$.errorMessage'))
$input.path('$.errorMessage')
#end`
  }
}


function _getHTML(statusCode) {
  var vtl = fs.readFileSync(path.join(__dirname, '_errors-html.vtl')).toString()
  var out = ''
  if (statusCode === '200') out = ok('html')
  if (statusCode === '302') out = `$input.path('$.errorMessage')`
  if (statusCode === '400') out = vtl
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '406') out = vtl
  if (statusCode === '409') out = vtl
  if (statusCode === '415') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'text/html': out
  }
}

function _getJSON(statusCode) {
  var vtl = fs.readFileSync(path.join(__dirname, '_errors-json.vtl')).toString()
  var out = ''
  if (statusCode === '200') out = ok('json')
  if (statusCode === '302') out = "$input.path('$.errorMessage')"
  if (statusCode === '400') out = vtl
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '406') out = vtl
  if (statusCode === '409') out = vtl
  if (statusCode === '415') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'application/json': out
  }
}

let _getJSONAPI = _getJSON

function _getText(statusCode) {
  var vtl = '$errorMessageObj.text'
  var out = ''
  if (statusCode === '200') out = ok('text')
  if (statusCode === '302') out = "$input.path('$.errorMessage')"
  if (statusCode === '400') out = vtl
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '406') out = vtl
  if (statusCode === '409') out = vtl
  if (statusCode === '415') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'text/plain': out
  }
}

function _getXML(statusCode) {
  var vtl = '$errorMessageObj.xml'
  var out = ''
  if (statusCode === '200') out = ok('xml')
  if (statusCode === '302') out = "$input.path('$.errorMessage')"
  if (statusCode === '400') out = vtl
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '406') out = vtl
  if (statusCode === '409') out = vtl
  if (statusCode === '415') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'application/xml': out
  }
}

function _getCSS(statusCode) {
  var vtl = '$errorMessageObj.css'
  var out = ''
  if (statusCode === '200') out = ok('css')
  if (statusCode === '302') out = "$input.path('$.errorMessage')"
  if (statusCode === '400') out = vtl
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '406') out = vtl
  if (statusCode === '409') out = vtl
  if (statusCode === '415') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'text/css': out
  }
}

function _getJS(statusCode) {
  var vtl = '$errorMessageObj.js'
  var out = ''
  if (statusCode === '200') out = ok('js')
  if (statusCode === '302') out = "$input.path('$.errorMessage')"
  if (statusCode === '400') out = vtl
  if (statusCode === '403') out = vtl
  if (statusCode === '404') out = vtl
  if (statusCode === '406') out = vtl
  if (statusCode === '409') out = vtl
  if (statusCode === '415') out = vtl
  if (statusCode === '500') out = vtl
  return {
    'text/javascript': out
  }
}
/* usage! loooool
callback(Error(JSON.stringify({
  html: '<blink>internal "server" error</blink>',
  statusCode: 500
}))) */
module.exports = function _getResponseTemplates(statusCode, type) {
  if (type === 'html')
    return _getHTML(statusCode)
  if (type === 'json')
    return _getJSON(statusCode)
  if (type === 'jsonapi')
    return _getJSONAPI(statusCode)
  if (type === 'text')
    return _getText(statusCode)
  if (type === 'xml')
    return _getXML(statusCode)
  if (type === 'css')
    return _getCSS(statusCode)
  if (type === 'js')
    return _getJS(statusCode)
}

