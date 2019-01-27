exports.handler = async function table(event) {
  let trigger = record=> triggers[record.eventName].bind({}, record)
  let tasks = event.Records.map(trigger)
  return await Promise.all(tasks)
}

let triggers = {
  INSERT(record) {
    console.log(JSON.stringify(record, null, 2))
    return Promise.resolve()
  },
  MODIFY(record) {
    console.log(JSON.stringify(record, null, 2))
    return Promise.resolve()
  },
  REMOVE(record) {
    console.log(JSON.stringify(record, null, 2))
    return Promise.resolve()
  }
}
