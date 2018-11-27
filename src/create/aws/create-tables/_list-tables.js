let aws = require('aws-sdk')

module.exports = function list(callback) {
  var db = new aws.DynamoDB({region: process.env.AWS_REGION})
  let collection = []
  !function _list(params, callback) {
    db.listTables(params, function _listTables(err, result) {
      if (err) {
        callback(err)
      }
      else if (result.LastEvaluatedTableName) {
        collection.push(result.TableNames)
        _list({
          ExclusiveStartTableName: result.LastEvaluatedTableName
        }, callback)
      }
      else {
        collection.push(result.TableNames)
        callback(null, collection.reduce((a, b)=>a.concat(b)))
      }
    })
  }({}, callback)
}
