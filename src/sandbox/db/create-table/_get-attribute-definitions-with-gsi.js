  module.exports = function getAttributeDefinitions(keys, name, indexes) {
    var tableName = name.split(/staging-|production-/)[1]
    var actual = indexes.filter(index=> index.hasOwnProperty(tableName)).map(x=> x[tableName])
    var some = keys.map(k=> ({AttributeName:k, AttributeType:'S'}))
    var all = some.concat(actual.map(idx=> {
      var theName = Object.keys(idx)[0]
      var theValue = idx[theName].replace(/\*+/g, '')
      return {
        AttributeName: theName,
        AttributeType: convert(theValue),
      }
    }))
    return all
  }

function convert(v) {
  // FIXME need to add other types besides S and N
  return ({
    'String':'S',
    'Number':'N',
  })[v]
}
