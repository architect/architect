let readArc = require("../../util/read-arc")
let {invokeLambda} = require('../_invoke-lambda')
let fs = require("fs")
let path = require("path")
let http = require("http")
let chalk = require("chalk")

module.exports = {start}

/**
 * creates a little web server on port 3334 that invokes @events and @queues
 * lambdas in forked subprocesses
 */
function start(callback) {
  let {arc} = readArc()
  let close = x => !x

  // if .arc has events or queues and we're not clobbering with ARC_LOCAL flag
  if ((arc.events || arc.queues) && !process.env.hasOwnProperty("ARC_LOCAL")) {
    let server = http.createServer(listener)
    // ends our little web server
    close = function _closer() {
      try {
        server.close()
      } catch (e) {
        console.log("swallowing server.close error in sandbox loopback", e)
      }
    }
    // start listening on 3334
    server.listen(3334, callback ? callback : x => !x)
  } else {
    callback()
  }
  return {close}
}

function listener(req, res) {
  let respond = (code, message) => {
    res.statusCode = code
    res.write(message)
    res.end()
  }
  let chunks = []
  req.on("data", chunk => chunks.push(chunk))
  req.on("end", () => {
    let body = JSON.parse(Buffer.concat(chunks).toString())
    let {lambda, event, delay} = body
    if (!lambda && !event && body.name && body.payload) {
      // backwards compatibility for older versions of @architect/functions
      lambda = "events/" + body.name
      event = {Records:[{Sns:{Message: JSON.stringify(body.payload)}}]}
    }

    let [lambdaType, lambdaName] = (lambda || "").split(/[/\\]+/)
    if (lambdaType !== "queues" && lambdaType !== "events") {
      respond(400, "invalid lambda type " + JSON.stringify(lambdaType))
      return
    }

    let {arc} = readArc()
    let isDefinedInArc = arc[lambdaType].some(name => name === lambdaName)
    if (!isDefinedInArc) {
      respond(404, "@" + lambda + " is not defined in .arc")
      return
    }

    let lambdaPath = path.join(process.cwd(), "src", lambda)
    let lambdaExists = fs.existsSync(lambdaPath)
    if (!lambdaExists) {
      respond(404, lambda + " does not exist in your src directory")
      return
    }

    // message is now accepted, whether invocation succeeds is no concern of the client
    respond(200, "ok")

    console.log(chalk.grey.dim("@" + lambdaType), chalk.green.dim(JSON.stringify(body, null, 2)))
    let reportError = error => {
      if (error) {
        console.log(chalk.red('@' + lambda) + ' ' + error.stack)
      }
    }
    if (lambdaType === 'queues' && body.delay > 0) {
      // simulate SQS DelaySeconds parameter
      setTimeout(invokeLambda, 1000 * body.delay, lambda, event, reportError)
    } else {
      invokeLambda(lambda, event, reportError)
    }
  })
}