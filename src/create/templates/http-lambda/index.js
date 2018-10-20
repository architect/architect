// Require Architect Functions to enable secure anonymous signed sessions, URL helpers, CSRF tokens, and more
// let arc = require('@architect/functions')

exports.handler = async function http(request) {
  try {
    if (process.env.NODE_ENV !== 'production') console.log(JSON.stringify(request, null, 2))
    return {
      type: 'text/html',
      body: 'Hello world!'
    }
  }
  catch(e) {
    console.error(e)
    return {
      status: 500,
      type: 'application/json; charset=utf8',
      body: JSON.stringify({
        name: e.name,
        message: e.message,
        stack:e.stack
      }, null, 2)
    }
  }
}

// Example responses

/* Forward requester to a new path
exports.handler = async function http(request) {
  return {
   status: 302,
   location: '/staging/about',
  }
}
*/

/* Successful resource creation, CORS enabled
exports.handler = async function http(request) {
  return {
    status: 201,
    type: 'application/json',
    body: JSON.stringify({ok: true}),
    cors: true,
  }
}
*/

/* Deliver client-side JS
exports.handler = async function http(request) {
  return {
    type: 'text/javascript',
    body: `console.log('Hello world!')`,
  }
}
*/
