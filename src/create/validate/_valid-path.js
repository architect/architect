module.exports = function validPath(p) {
  // starts with a /
  if (p[0] != '/')
    return Error('Paths must start with /.')

  // less than 35 chars
  if (p.length > 35)
    return Error('Path must be less than 35 characters.')

  // does not end with a slash
  if (p.length > 1 && p.split('').reverse()[0] === '/')
    return Error('Path must not end with /.')

  // can have letters, numbers, dashes, slashes and/or :params
  function bads(c) {
    var allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-:._'.split('')
    return !allowed.includes(c)
  }
  var bad = p.slice().split('').filter(bads)
  var uniq = {}
  bad.forEach(b=> uniq[b] = true)
  bad = Object.keys(uniq).join(', ')
  if (bad.length > 0) return Error(`Invalid character${bad.length === 1? '' : 's'}: ${bad}`)

  // no leading or trailing non-alphanumeric characters
  var leadingOrTrailingChars = p.match(/\/(-|\.|_).*/g) ||
                               p.match(/.*(-|:|\.|_)($|\/)/g)
  if (leadingOrTrailingChars) {
    return Error('Invalid function name: path parts can only begin or with letters or numbers.')
  }

  // params always include /:
  var params = p.match(/\/:.*/g)

  // params must have one or more chars
  if (params) {
    var tooShort = params.filter(p=> p.length === 1)
    if (tooShort.length > 0) return Error('Unnamed parameter: params need a name like <code>:foo</code> or <code>:someID</code>')
  }

  // params cannot have non-alphanumeric characters
  if (params) {
    let match = p.match(/\/:[a-zA-Z0-9]*(\/|$)/g)
    if (!match) return Error('Invalid parameter: params can only accept alphanumeric characters.')
  }

  // TODO - check to make sure : is ONLY used at the beginning of a part
  var invalidParamSyntax = p.match(/\/\w+:\w*/g)

  if (invalidParamSyntax) {
    return Error('Invalid path: colons can only be used at the beginning of a URL part.')
  }
}
