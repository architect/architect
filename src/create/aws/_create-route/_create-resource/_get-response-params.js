module.exports = function _getReponseParams(type) {

  let headers = {
    'method.response.header.Set-Cookie': 'integration.response.body.cookie',
    'method.response.header.Location': 'integration.response.body.errorMessage',
  }

  if (type === 'html')
    headers['method.response.header.Content-Type'] = "'text/html; charset=utf-8'"
  if (type === 'json')
    headers['method.response.header.Content-Type'] = "'application/json'"
  if (type === 'jsonapi')
    headers['method.response.header.Content-Type'] = "'application/vnd.api+json'"
  if (type === 'text')
    headers['method.response.header.Content-Type'] = "'text/plain; charset=utf-8'"
  if (type === 'xml')
    headers['method.response.header.Content-Type'] = "'application/xml'"
  if (type === 'css')
    headers['method.response.header.Content-Type'] = "'text/css; charset=utf-8'"
  if (type === 'js')
    headers['method.response.header.Content-Type'] = "'text/javascript; charset=utf-8'"

  return headers
}
