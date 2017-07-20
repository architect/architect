module.exports = function _getReponseParams(type) {
  if (type === 'html') {
    return {
      'method.response.header.Content-Type': "'text/html'",
      'method.response.header.Set-Cookie': 'integration.response.body.cookie',
      'method.response.header.Location': 'integration.response.body.errorMessage',
    }
  }
  else {
    return {
      'method.response.header.Content-Type': "'application/json'",
      'method.response.header.Set-Cookie': 'integration.response.body.cookie',
      'method.response.header.Location': 'integration.response.body.errorMessage',
    }
  }
}
