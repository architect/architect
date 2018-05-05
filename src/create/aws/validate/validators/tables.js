let regexp = require('../_regexp')
let Err = require('../_error-factory')

module.exports = function tables(arc, raw) {
  // optimism
  var errors = []
  // loop thru the .arc tables
  if (arc.tables) {
    arc.tables.forEach(table=> {

      // grabs the current tables name
      var tablename = Object.keys(table)[0]

      // ensure a good table name
      var tablenameValid = regexp.tablename.test(tablename)
      if (!tablenameValid) {
        errors.push(Err({
          message: `@tables name invalid`,
          linenumber: findLineNumber(tablename, raw),
          raw,
          arc,
          detail: '@table name must be alphanumeric, lowercase, dasherized and start with a letter.',
        }))
      }

      var partition = checkPartition(table[tablename])
      if (!partition) {
        errors.push(Err({
          message: `@tables invalid partition key`,
          linenumber: findLineNumber(tablename, raw),
          raw,
          arc,
          detail: '@table must have one partition key of either *String or *Number type.',
        }))
      }

      var sort = checkSort(table[tablename])
      if (!sort) {
        errors.push(Err({
          message: `@tables invalid sort key`,
          linenumber: findLineNumber(tablename, raw),
          raw,
          arc,
          detail: '@table may have one sort key of either **String or **Number type.',
        }))
      }
      // todo checks for insert, update, destroy Lambda types
    })
  }
  return errors
}

function findLineNumber(search, raw) {
  var lines = raw.split('\n')
  for (var i = 0; i <= lines.length; i++) {
    if (lines[i] && lines[i].startsWith(search)) {
      return i + 1
    }
  }
  return -1
}

// tables must have one partition key of either *String or *Number
// expects {someKey:'*String', someOtherKey:'**String', insert: 'Lambda'}
function checkPartition(obj) {
  var count = 0
  Object.keys(obj).forEach(key=> {
    if (obj[key] === '*String') count += 1
    if (obj[key] === '*Number') count += 1
  })
  return count === 1
}

// tables can only have one sort key of either **String or **Number
function checkSort(obj) {
  var count = 0
  Object.keys(obj).forEach(key=> {
    if (obj[key] === '**String') count += 1
    if (obj[key] === '**Number') count += 1
  })
  return count <= 1
}

