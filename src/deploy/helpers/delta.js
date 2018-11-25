// let fs = require('fs')
// let path = require('path')
let create = require('../../create')
let getName = require('../../util/get-lambda-name')

module.exports = function delta(arc, retries, callback) {
  let diff = {
    app: [arc.app[0]],
    http: [],
    scheduled: [],
    queues: [],
    events: [],
    tables: [],
  }
  if (arc.http) {
    arc.http.forEach(route=> {
      if (isHttpRetry(route, retries)) {
        diff.http.push(route)
      }
    })
  }
  if (arc.scheduled) {
    arc.scheduled.forEach(bit=> {
      if (isScheduledRetry(bit, retries)) {
        diff.scheduled.push(bit)
      }
    })
  }
  if (arc.queues) {
    arc.queues.forEach(bit=> {
      if (isQueuesRetry(bit, retries)) {
        diff.queues.push(bit)
      }
    })
  }
  if (arc.events) {
    arc.events.forEach(bit=> {
      if (isEventsRetry(bit, retries)) {
        diff.events.push(bit)
      }
    })
  }
  if (arc.tables) {
    arc.tables.forEach(bit=> {
      if (isTablesRetry(bit, retries)) {
        diff.tables.push(bit)
      }
    })
  }
  let raw = stringify(diff)
  create(diff, raw, callback)
}

function isHttpRetry(thing, retries) {
  let verb = thing[0]
  let action = getName(thing[1])
  let name = `${verb}${action}`
  return retries.some(one=> one.includes(name))
}

function isScheduledRetry(thing, retries) {
  let name = getName(thing[0])
  return retries.some(one=> one.includes(name))
}

function isQueuesRetry(thing, retries) {
  let name = getName(thing)
  return retries.some(one=> one.includes(name))
}

function isEventsRetry(thing, retries) {
  let name = getName(thing)
  return retries.some(one=> one.includes(name))
}

function isTablesRetry(thing, retries) {
  let name = Object.keys(thing)[0]
  let allowed = i=> 'insert update delete'.split(' ').includes(i)
  let tblFmt = i=> getName(name + '-' + i)
  let keys = Object.keys(thing[name]).filter(allowed).map(tblFmt)
  let found = false
  keys.forEach(k=> {
    if (retries.some(one=> one.includes(k))) {
      found = true
    }
  })
  return found
}

function stringify(arc) {
  let str = `@app\n${arc.app[0]}\n`
  /////////////////////////////////
  if (arc.http.length > 0)
    str += `\n@http\n` + arc.http.map(tuple=> tuple.join(' ') + '\n')

  if (arc.events.length > 0)
    str += `\n@events\n` + arc.events.join('\n')

  if (arc.queues.length > 0)
    str += `\n@queues\n` + arc.queues.join('\n')

  if (arc.scheduled.length > 0)
    str += `\n@scheduled\n` + arc.scheduled.map(v=> v.join(' ')).join('\n')

  if (arc.tables.length > 0)
    str += `\n@tables\n` + arc.scheduled.join('\n')
  //////////
  return str
}
