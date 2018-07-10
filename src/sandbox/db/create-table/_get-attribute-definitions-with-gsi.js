var clean = require('./_remove-ttl-and-lambda')

// turns {foo:'*String', bar:'**String'}
// into [{AttributeName:'foo', AttributeType:'S'}, {AttributeName:'bar', AttributeType:'S'}]
function fixer(obj) {
  var result = []
  Object.keys(obj).forEach(AttributeName=> {
    result.push({
      AttributeName,
      AttributeType: obj[AttributeName].replace('**', '').replace('*', '').replace('Number', 'N').replace('String', 'S')
    })
  })
  return result
}

module.exports = function getAttributeDefinitions(attr, name, indexes) {

  var tableName = name.split(/staging-|production-/)[1]

  // an array of attributes from indexes [idx:'*String', ts:'**Number}] for example
  var actual = indexes.filter(index=> index.hasOwnProperty(tableName)).map(x=> x[tableName])

  // interpolates attrs from table definitions and indexes
  var fixed = actual.map(fixer).concat(fixer(clean(attr))).reduce((a,b)=> a.concat(b))

  // an array of [{AttributeName, AttributeType}]
  return fixed
}

