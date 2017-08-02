var fs = require('fs')
var path = require('path')

module.exports = function _getReqTmpl(type) {
  if (type === 'events') {
    return {
      'application/json': "$input.json('$')",
    }
  }
  else if (type === 'actions') {
    var ugh = ''
    ugh += '#set ($encodedJSON = $input.body.substring(8))\n'
    ugh += '$util.urlDecode(${encodedJSON})'
    return {
      'application/x-www-form-urlencoded': ugh   
    }
  }
  else if (type === 'options') {
    return {
      'application/json': "$input.json('$')",
    }
  }
  else if (type === 'slash') {
    var ugh2 = fs.readFileSync(path.join(__dirname, '_slash.vtl')).toString()
    return {
      'application/x-www-form-urlencoded': ugh2
    }
  }
  else {
    throw Error('only actions and events impl')
  }
}
