/* eslint global-require: "off" */
let path = require('path')

/**
 * listen for events to run
 */
process.on('message', function msg(message) {
  // require in the lambda
  let lambda = require(path.join(process.cwd(), 'src', 'events', message.name))
  // mock out an SNS payload...
  let event = {Records:[{Sns:{Message:JSON.stringify(message.payload)}}]} // this is fine
  // mock context
  let context = {}
  // run the lambda locally
  lambda.handler(event, context, function done(err) {
    let text = err? `@event ${message.name} failed with ${err.message}` : `@event ${message.name} complete`
    // send a message to the parent node process
    process.send({text})
    // cleanup
    process.exit()
  })
})
