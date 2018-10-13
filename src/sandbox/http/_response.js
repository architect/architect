module.exports = function _local(type, res) {

  return function _res(err, result) {

    var isError = err
    var isRedirect = err && (err.startsWith('/') || err.startsWith('http'))
    if (result.location) {
      isRedirect = true
      err = result.location
    }

    var isNot200JSON = err && type === 'json'
    var isNot200HTML = err && type === 'html'
    var isNot200JS = err && type === 'js'
    var isNot200CSS = err && type === 'css'
    var isNot200TEXT = err && type === 'text'
    var isNot200XML = err && type === 'xml'

    var is200JSON = type === 'json' && result && result.json
    var is200HTML = type === 'html' && result && result.html
    var is200JS = type === 'js' && result && result.js
    var is200CSS = type === 'css' && result && result.css
    var is200TEXT = type === 'text' && result && result.text
    var is200XML = type === 'xml' && result && result.xml

    // remove Secure because localhost won't be SSL (and the cookie won't get set)
    if (result && result.cookie) {
      res.setHeader('Set-Cookie', result.cookie.replace('; Secure', '; Path=/'))
    }
    if (isError) {
      try {
        var v = JSON.parse(err)
        if (v.cookie) {
          res.setHeader('Set-Cookie', v.cookie.replace('; Secure', '; Path=/'))
        }
      }
      catch(e) {
        // swallow it
      }
    }

    // order important here; we want to fail isError as a last resort
    if (isRedirect) {
      res.statusCode = 302
      res.setHeader('Location', err)
      res.end(`\n`)
    }
    else if (result.status || result.code || result.type || result.body) {
      res.setHeader('Content-Type', result.type || 'application/json; charset=utf-8')
      res.statusCode = result.status || result.code || 200
      res.end(result.body)
    }
    else if (isNot200JSON) {
      var v = JSON.parse(err)
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.statusCode = v.statusCode
      res.end(`${JSON.stringify(v.json)}\n`)
    }
    else if (isNot200HTML) {
      var v = JSON.parse(err)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.statusCode = v.statusCode
      res.end(`${v.html}\n`)
    }
    else if (isNot200JS) {
      var v = JSON.parse(err)
      res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
      res.statusCode = v.statusCode
      res.end(`${v.js}\n`)
    }
    else if (isNot200CSS) {
      var v = JSON.parse(err)
      res.setHeader('Content-Type', 'text/css; charset=utf-8')
      res.statusCode = v.statusCode
      res.end(`${v.css}\n`)
    }
    else if (isNot200TEXT) {
      var v = JSON.parse(err)
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.statusCode = v.statusCode
      res.end(`${v.text}\n`)
    }
    else if (isNot200XML) {
      var v = JSON.parse(err)
      res.setHeader('Content-Type', 'application/xml; charset=utf-8')
      res.statusCode = v.statusCode
      res.end(`${v.xml}\n`)
    }
    else if (isError) {
      res(err)
    }
    else if (is200JSON) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(`${JSON.stringify(result.json, null, 2)}\n`)
    }
    else if (is200HTML) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(`${result.html}\n`)
    }
    else if (is200JS) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
      res.end(`${result.js}\n`)
    }
    else if (is200CSS) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/css; charset=utf-8')
      res.end(`${result.css}\n`)
    }
    else if (is200TEXT) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(`${result.text}\n`)
    }
    else if (is200XML) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/xml; charset=utf-8')
      res.end(`${result.xml}\n`)
    }
    else {
      throw Error('Uknown Response Type WTF')
    }
  }
}
