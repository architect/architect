let Err = require('./_error-factory')
let validPath = require('./_valid-path')

/**
 * rest
 * ---
 * validators for @json, @xml
 */
module.exports = function _rest(type, arc, raw) {
  var errors = []
  if (arc[type]) {
    // rest sections are arrays of tuples
    var isTuple = v=> Array.isArray(v) && v.length === 2
    var validTypes = Array.isArray(arc[type]) && arc[type].map(isTuple)
    if (!validTypes) {
      errors.push(Error(`@${type} is invalid`))
    }
    else {
      arc[type].forEach(route=> {
        var path = route[1]
        var err = validPath(path)
        if (err) {
            errors.push(Err({
              message: `@${type} invalid route`,
              linenumber: findLineNumber(route, raw),
              raw,
              arc,
              detail: err.message + ' HTTP reference: https://arc.codes/guides/http',
            }))
        }
      })
      // for each route in routes
      // check for errors.length

      // errors.push(Error(`invalid url`))
      /*
      var validUrl =   // TODO routes[1] must be a valid url that starts with /
      var noTrailingSlash =  // TODO routes[1] must not end in /
      var uniq =   // TODO routes must be unique
      */
    }
  }
  return errors
}

function findLineNumber(tuple, raw) {
  var search = tuple.join(' ')
  var lines = raw.split('\n')
  for (var i = 0; i <= lines.length; i++) {
    if (lines[i] && lines[i].startsWith(search)) {
      return i + 1
    }
  }
  return -1
}
