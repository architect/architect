exports.handler = async function ws(event) {
  console.log(JSON.stringify(event, null, 2))
  return {statusCode: 200}
}
