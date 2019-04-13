/**
 * Emaultes our API Gateway binary → base64 handling
 */
module.exports = function binary(req, res, next) {
  function isBinary(headers) {
    let binaryTypes = /^application\/octet-stream/
    let multipartFormData = /^multipart\/form-data/
    if (binaryTypes.test(headers['content-type'])) return true
    if (multipartFormData.test(headers['content-type'])) return true
    return false
  }

  if (isBinary(req.headers)) {
    let body = []
    req.on('data', chunk => {
      body.push(chunk)
      req.resume()
    })
    req.on('end', () => {
      let base64 = Buffer.concat(body).toString('base64')
      req.body = { base64 } || {}
      next()
    })
  }
  else {
    next()
  }
}