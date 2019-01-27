// Learn more: https://arc.codes/guides/http
exports.handler = async function http(req) {
  console.log(req)
  return {
    type: 'text/html; charset=utf8',
    body: '<h1>Hello world!</h1>'
  }
}
