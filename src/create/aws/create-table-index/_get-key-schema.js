var getKeyType = require('./_get-key-type')

module.exports = function getKeySchema(attr) {
  var keys = Object.keys(attr)
  return keys.map(k=> {
    return {
      AttributeName: k,
      KeyType: getKeyType(attr[k])
    }
  })
}
