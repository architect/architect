module.exports = function validPath(p) {
  // starts with a /
  if (p[0] != '/')
    return Error('Paths must start with /.')

  // less than 25 chars
  if (p.length > 25)
    return Error('Path must be less than 25 characters.')

  // does not end with a slash
  if (p.length > 1 && p.split('').reverse()[0] === '/')
    return Error('Path must not end with /.')

  // can have letters, numbers, dashes, slashes and/or :params
  function bads(c) {
    var allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:.'.split('')
    return !allowed.includes(c)
  }
  var bad = p.slice().split('').filter(bads)
  var uniq = {}
  bad.forEach(b=> uniq[b] = true)
  bad = Object.keys(uniq).join(', ')
  if (bad.length > 0) return Error(`Invalid character${bad.length === 1? '' : 's'}: ${bad}`)

  // params must have one or more chars
  var params = p.match(/:\w*/g)
  if (params) {
    var tooShort = params.filter(p=> p.length === 1)
    if (tooShort.length > 0) return Error('Unnamed parameter! Params need a name like <code>:foo</code> or <code>:someID</code>')
  }
}
