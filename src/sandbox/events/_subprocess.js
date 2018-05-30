/* eslint global-require: "off" */
let path = require('path')

process.on('message', function msg(message) {
  // require in the lambda
  let lambda = require(path.join(process.cwd(), 'src', 'events', message.name))
  let event = {Records:[{Sns:{Message:JSON.stringify(message.payload)}}]} // this is fine
  let context = {}
  // run it
  lambda.handler(event, context, function(err) {
    if (err) {
      process.send({text: `@event ${message.name} failed with ${err.message}`})
    }
    else {
      process.send({text: `@event ${message.name} complete`})
    }
    process.exit()
  })
})
