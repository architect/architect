let url = require('url')
let invoke = require('./invoke-lambda')

/**
 * builds response middleware for invoke
 */
module.exports = function invokeHTTP({verb, pathToFunction}) {

  return function respond(req, res) {

    // HACK api gateway 'Cookie' from express 'cookie'
    req.headers.Cookie = req.headers.cookie
    delete req.headers.cookie

    let request = {
      method: verb,
      httpMethod: verb,
      path: url.parse(req.url).pathname,
      headers: req.headers,
      query: url.parse(req.url, true).query,
      queryStringParameters: url.parse(req.url, true).query,
      body: req.body,
      params: req.params,
    }

    // run the lambda sig locally
    invoke(pathToFunction, request, function _res(err, result) {
      if (err) res(err)
      else {
        res.setHeader('Content-Type', result.type || 'application/json; charset=utf-8')
        res.statusCode = result.status || result.code || result.statusCode || 200

        // remove Secure because localhost won't be SSL (and the cookie won't get set)
        if (result.cookie)
          res.setHeader('Set-Cookie', result.cookie.replace('; Secure', '; Path=/'))

        if (result.location)
          res.setHeader('Location', result.location)

        if (result.cors)
          res.setHeader('Access-Control-Allow-Origin', '*')

        if (result.cacheControl)
          res.setHeader('cache-control', result.cacheControl)

        if (result.headers) {
          Object.keys(result.headers).forEach(k=> {
            res.setHeader(k, result.headers[k])
          })
        }

        if (result.isBase64Encoded) {
          let documents = [
            'application/javascript',
            'application/json',
            'text/css',
            'text/html',
            'text/javascript',
            'text/plain',
            'text/xml'
          ]
          // Check to see if it's a known-supported doc without assuming normalized header casing
          // Gross but it works
          if (documents.some(d => {
            let isText =
              result.headers && result.headers['content-type'].startsWith(d) ||
              result.headers && result.headers['Content-Type'].startsWith(d) ||
              result.type && result.type.startsWith(d)
            return isText
          })) {
            result.body = Buffer.from(result.body, 'base64').toString()
          }
          // Otherwise it's a binary
          else result.body = Buffer.from(result.body, 'base64')
        }

        // Re-encode nested JSON responses
        if (typeof result.json !== 'undefined') {
          // CYA in case we receive an object instead of encoded JSON
          try {
            let body = result.body // noop the try
            // Real JSON will create an object
            let maybeRealJSON = JSON.parse(result.body)
            if (typeof maybeRealJSON !== 'object')
              result.body = body
          }
          catch (e) {
            // JSON-parsing an object will fail, so JSON stringify it
            result.body = JSON.stringify(result.body)
          }
        }

        res.end(result.body || '\n')
      }
    })
  }
}
