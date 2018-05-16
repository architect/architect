module.exports = function isReserved(key) {
  var reserved = ['NODE_ENV', 'ARC_APP_NAME', 'SESSION_TABLE_NAME']
  return reserved.includes(key)
}
