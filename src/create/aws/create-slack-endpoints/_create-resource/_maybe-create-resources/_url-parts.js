/**
 * takes a url and returns an array of parts
 *
 * eg.
 *
 *    /foo/bar/baz
 *
 * becomes
 *
 *    ['/', '/foo', '/foo/bar', '/foo/bar/baz']
 */
module.exports = function _urlParts(url) {
  var parts = url.split('/')//.filter(Boolean)
  var last = ''
  var index = 0
  var most = parts.map(part=> {
    var bit = index === 0? last + part : last + '/' + part
    last = bit
    index += 1
    return bit
  })
  most[0] = '/'
  return most
}
