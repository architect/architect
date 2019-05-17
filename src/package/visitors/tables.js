let toLogicalID = require('../to-logical-id')

module.exports = function(arc, result) {
  arc.tables.forEach(table=> {

    let tbl = Object.keys(table)[0]
    let attr = table[tbl]
    let keys = Object.keys(clean(attr))

    let KeySchema = getKeySchema(attr, keys)
    let hasTTL = getTTL(attr)
    let TableName = toLogicalID(tbl)
    let AttributeDefinitions = getAttributeDefinitions(clean(attr))

    result[`${TableName}Table`] = {
      Type: 'AWS::DynamoDB::Table',
      Properties: {
        KeySchema,
        TableName: tbl,
        AttributeDefinitions,
        BillingMode: 'PAY_PER_REQUEST',
        //GlobalSecondaryIndexes: [ GlobalSecondaryIndex, ... ],
        //StreamSpecification: StreamSpecification,
      }
    }

    if (hasTTL) {
      result[`${TableName}Table`].Properties.TimeToLiveSpecification = {
        AttributeName : hasTTL,
        Enabled: true
      }
    }

    // TODO if stream defined
    // TODO if indexes defined
  })
  return result
}

function clean(attr) {
  var clean = {}
  Object.keys(attr).forEach(k=> {
    if (attr[k] != 'TTL' && attr[k] != 'Lambda') {
      clean[k] = attr[k]
    }
  })
  return clean
}

function getTTL(attr) {
  var found = false
  Object.keys(attr).forEach(k=> {
    if (attr[k] === 'TTL') {
      found = k
    }
  })
  return found
}

function getKeySchema(attr, keys) {
  return keys.map(k=> {
    return {
      AttributeName: k,
      KeyType: getKeyType(attr[k])
    }
  })
}

function getKeyType(k) {
  var hashkeys = [
    '*String',
    '*Number',
    'HashString',
    'HashNumber',
    'PartitionString',
    'PartitionNumber'
  ]
  var rangekeys = [
    '**String',
    '**Number',
    'RangeString',
    'RangeNumber',
    'SortString',
    'SortNumber'
  ]
  if (hashkeys.includes(k)) {
    return 'HASH'
  }
  else if (rangekeys.includes(k)) {
    return 'RANGE'
  }
  else {
    throw Error('Unknown key type.')
  }
}

function getAttributeDefinitions(attr) {
  function convert(v) {
    return ({
      'String':'S',
      'Number':'N'
    })[v]
  }
  var defs = [];
  Object.keys(attr).forEach(function(k, i) {
    defs[i] = {
      AttributeName: k,
      AttributeType: convert(attr[k].replace(/\*+/g, '')),
    }
  })
  return defs
}
