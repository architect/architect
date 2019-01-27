exports.handler = async function subscribe(event) {
  // sns sends batches of records
  let raw = event.Records.map(r=> r.Sns.Message)
  let events = raw.map(JSON.parse).map(handler)
  // run handler for each one in parallel
  return await Promise.all(events)
}

// handle one sns event message
function handler(event) {
  console.log(JSON.stringify(event, null, 2))
  return Promise.resolve()
}
