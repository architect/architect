/* eslint global-require: "off" */
let path = require('path')

/**
 * listen for events to run
 */
process.on('message', function msg(message) {
  // require in the lambda
  let lambda = require(path.join(process.cwd(), 'src', message.arcType + 's', message.name))
  // mock out an SNS payload...
  let event = mockEvent(message)
  // mock context
  let context = {}
  // run the lambda locally
  lambda.handler(event, context, function done(err) {
    let text = err? `@${message.arcType} ${message.name} failed with ${err.stack}` : `@${message.arcType} ${message.name} complete`
    // send a message to the parent node process
    process.send({text})
    // cleanup
    process.exit()
  })
})

function mockEvent(message) {
  switch (message.arcType) {
  case "event":
    return {Records:[{Sns:{Message:JSON.stringify(message.payload)}}]}; // this is fine
  case "queue":
    return { Records: [{ body: JSON.stringify(message.payload) }] }; // also fine
  default:
    throw new Error('Unrecognized event type ' + message.arcType)
  }
}