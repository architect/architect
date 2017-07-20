  module.exports = function getAttributeDefinitions(keys) {
    return keys.map(k=> ({AttributeName:k, AttributeType:'S'}))
  }
