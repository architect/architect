exports.handler = async function scheduled(event, context) {
  console.log(JSON.stringify({event, context}, null, 2))
  return;
}
