
/**
 * http
 * ---
 * validators for @html, @json
 */
module.exports = function _http(type, arc) {
  var errors = []
  if (arc[type]) {
    // http sections are arrays of tuples
    var isTuple = v=> Array.isArray(v) && v.length === 2
    var validTypes = Array.isArray(arc[type]) && arc[type].map(isTuple)
    if (!validTypes) {
      errors.push(Error(`@${type} is invalid`))
    }
    else {
      // if the shape of the data is ok we can check the contents
      // routes must be either get or post
      function notGetOrPost(tuple) {
        var v = tuple[0].toLowerCase()
        if (v === 'get') return false
        if (v === 'post') return false
        return true
      }
      var invalidVerbs = arc[type].filter(notGetOrPost)
      invalidVerbs.forEach(fkdtuple=> {
        errors.push(Error(`@${type} can only be GET or POST; unknown verb ${fkdtuple[0]}`))
      })
      /*
      var validUrl =   // TODO routes[1] must be a valid url that starts with /
      var noTrailingSlash =  // TODO routes[1] must not end in /
      var uniq =   // TODO routes must be unique
      */
    }
  }
  return errors
}
