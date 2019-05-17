module.exports = function getTTL(attr) {
  var found = false
  Object.keys(attr).forEach(k=> {
    if (attr[k] === 'TTL') {
      found = k
    }
  })
  return found
}
