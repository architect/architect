module.exports = function getKeyType(k) {
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
