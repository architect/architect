module.exports = function _getGSI(name, indexes) {
  var tableName = name.split(/staging-|production-/)[1]
  var actual = indexes.filter(index=> index.hasOwnProperty(tableName))
  if (actual.length >= 1) {
    return actual.map(idx=> {
      var keys = Object.keys(idx[tableName])
      if (keys.length > 2 || keys.length < 1) {
        throw Error(`@indexes ${tableName} has wrong number of keys`)
      }
      var hasOne = keys.length === 1
      var hasTwo = keys.length === 2
      var IndexName = hasOne? `${name}-${keys[0]}-index` : `${name}-${keys[0]}-${keys[1]}-index`
      // always add the HASH key (partition)
      var KeySchema = [{
        AttributeName: keys[0],
        KeyType: 'HASH'
      }]
      // maybe add the RANGE key (sort)
      if (hasTwo) {
        KeySchema.push({
          AttributeName: keys[0],
          KeyType: 'RANGE'
        })
      }
      var params = {
        IndexName,
        KeySchema,
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
      return params
    })
  }
  else {
    return false
  }
}
