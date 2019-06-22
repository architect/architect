let getKeyType = require('./get-key-type')

module.exports = function getKeySchema(attr, keys) {
  return keys.map(k=> {
    return {
      AttributeName: k,
      KeyType: getKeyType(attr[k])
    }
  })
}
