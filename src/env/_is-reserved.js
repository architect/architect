module.exports = function isReserved(key) {
  var reserved = ['NODE_ENV', 'ARC_APP_NAME']
  return reserved.includes(key)
}
