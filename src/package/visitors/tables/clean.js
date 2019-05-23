module.exports = function clean(attr) {
  var clean = {}
  Object.keys(attr).forEach(k=> {
    if (attr[k] != 'TTL' && attr[k] != 'Lambda') {
      clean[k] = attr[k]
    }
  })
  return clean
}
