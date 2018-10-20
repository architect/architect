module.exports = function _local(type, res) {
  return function _res(err, result) {
    if (err) {
      res(err)
    }
    else {
      res.setHeader('Content-Type', result.type || 'application/json; charset=utf-8')
      res.statusCode = result.status || result.code || 200

      // remove Secure because localhost won't be SSL (and the cookie won't get set)
      if (result.cookie)
        res.setHeader('Set-Cookie', result.cookie.replace('; Secure', '; Path=/'))

      if (result.location)
        res.setHeader('Location', result.location)

      res.end(result.body || '\n')
    }
  }
}
