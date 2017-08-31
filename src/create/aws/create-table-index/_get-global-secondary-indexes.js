var getKeySchema = require('./_get-key-schema')

module.exports = function _getGsi(name, attr) {
  return [{
    Create: {
      IndexName: name,
      KeySchema: getKeySchema(attr),
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  }]
}
