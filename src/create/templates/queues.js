exports.handler = async function queue(event) {
  // sqs triggers send batches of records
  let events = event.Records.map(r=> r.body).map(JSON.parse)
  let tasks = events.map(handler)
  return await Promise.all(tasks)
}

function handler(record) {
  console.log(JSON.stringify(record, null, 2))
  return Promise.resolve()
}
