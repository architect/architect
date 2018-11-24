let getLambdaName = require('../util/get-lambda-name')
let getLegacyLambdaName = require('../util/get-legacy-lambda-name')
let path = require('path')

/**
 * {
 *   app,
 *   restapis,
 *   lambdas,
 *   iamroles,
 *   snstopics,
 *   s3buckets,
 *   tables,
 *
 *   TODO cloudwatch rules
 *   TODO add SSM Params used by env
 *   TODO additional iam roles
 * }
 */
module.exports = function inventory(arc, raw, callback) {

  let app = arc.app[0]

  let report = {
    app,
    restapis: [
      `${app}-staging`,
      `${app}-production`,
    ],
    lambdas: [],
    types: {
      http:[],
      css:[],
      events:[],
      html:[],
      js:[],
      json:[],
      queues:[],
      scheduled:[],
      slack:[],
      tables:[],
      text:[],
      xml:[],
    },
    iamroles: ['arc-role'],
    snstopics: [],
    s3buckets: [],
    tables: [],
    localPaths: [],
  }

  // gets an http lambda name
  function getName(tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLambdaName(tuple[1])
      return [`${app}-production-${verb}${path}`, `${app}-staging-${verb}${path}`]
    }
    else {
      var path = getLambdaName(tuple)
      return [`${app}-production-get${path}`, `${app}-staging-get${path}`]
    }
  }

  function getPath(type, tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLambdaName(tuple[1])
      return ['src', type, `${verb}${path}`]
    }
    else {
      return ['src', type, `${tuple}`]
    }
  }

  // gets an http filesystem name
  function getSystemName(tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLambdaName(tuple[1])
      return `${verb}${path}`
    }
    else {
      var path = getLambdaName(tuple)
      return `get${path}`
    }
  }

  // gets an legacy lambda name
  function getLegacyName(tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLegacyLambdaName(tuple[1])
      return [`${app}-production-${verb}${path}`, `${app}-staging-${verb}${path}`]
    }
    else {
      var path = getLegacyLambdaName(tuple)
      return [`${app}-production-get${path}`, `${app}-staging-get${path}`]
    }
  }

  // gets an legacy filesystem name
  function getLegacySystemName(tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLegacyLambdaName(tuple[1])
      return `${verb}${path}`
    }
    else {
      var path = getLegacyLambdaName(tuple)
      return `get${path}`
    }
  }


  // get an sns lambda name
  function getEventName(event) {
    return [`${app}-production-${event}`, `${app}-staging-${event}`]
  }

  // get a scheduled lambda name
  function getScheduledName(arr) {
    var name = arr.shift()
    return [`${app}-production-${name}`, `${app}-staging-${name}`]
  }

  // get a table name
  function getTableName(tbl) {
    return Object.keys(tbl)[0]
  }

  if (arc.http && arc.http.length > 0) {
    report.lambdas = arc.http.map(getName).reduce((a,b)=>a.concat(b))
    report.types.http = arc.http.map(getSystemName)
    report.localPaths = arc.http.map(function fmt(tuple) {
      let base = path.join.apply({}, getPath('http', tuple))
      let full = path.join(process.cwd(), base)
      return full
    })
  }

  if (arc.html && arc.html.length > 0) {
    report.lambdas = report.lambdas.concat(arc.html.map(getLegacyName).reduce((a,b)=>a.concat(b)))
    report.types.html = arc.html.map(getLegacySystemName)
  }

  if (arc.json && arc.json.length > 0) {
    report.lambdas = report.lambdas.concat(arc.json.map(getLegacyName).reduce((a,b)=>a.concat(b)))
    report.types.json = arc.json.map(getLegacySystemName)
  }

  if (arc.js && arc.js.length > 0) {
    report.lambdas = report.lambdas.concat(arc.js.map(getLegacyName).reduce((a,b)=>a.concat(b)))
    report.types.js = arc.js.map(getLegacySystemName)
  }

  if (arc.css && arc.css.length > 0) {
    report.lambdas = report.lambdas.concat(arc.css.map(getLegacyName).reduce((a,b)=>a.concat(b)))
    report.types.css = arc.css.map(getLegacySystemName)
  }

  if (arc.text && arc.text.length > 0) {
    report.lambdas = report.lambdas.concat(arc.text.map(getLegacyName).reduce((a,b)=>a.concat(b)))
    report.types.text = arc.text.map(getLegacySystemName)
  }

  if (arc.xml && arc.xml.length > 0) {
    report.lambdas = report.lambdas.concat(arc.xml.map(getLegacyName).reduce((a,b)=>a.concat(b)))
    report.types.xml = arc.xml.map(getLegacySystemName)
  }

  if (arc.events && arc.events.length > 0) {
    report.lambdas = report.lambdas.concat(arc.events.map(getEventName).reduce((a,b)=>a.concat(b)))
    report.types.events = arc.events.slice(0)
    arc.events.forEach(e=> {
      report.snstopics.push(`${app}-staging-${e}`)
      report.snstopics.push(`${app}-production-${e}`)
    })
    report.localPaths = report.localPaths.concat(arc.http.map(function fmt(tuple) {
      let base = path.join.apply({}, getPath('events', tuple))
      let full = path.join(process.cwd(), base)
      return full
    }))
  }

  if (arc.slack) {
    arc.slack.forEach(b=> {
      report.types.slack.push(`${b}-events`)
      report.types.slack.push(`${b}-slash`)
      report.types.slack.push(`${b}-actions`)
      report.types.slack.push(`${b}-options`)
      report.lambdas.push(`${app}-staging-slack-${b}-events`)
      report.lambdas.push(`${app}-staging-slack-${b}-slash`)
      report.lambdas.push(`${app}-staging-slack-${b}-actions`)
      report.lambdas.push(`${app}-staging-slack-${b}-options`)
      report.lambdas.push(`${app}-production-slack-${b}-events`)
      report.lambdas.push(`${app}-production-slack-${b}-slash`)
      report.lambdas.push(`${app}-production-slack-${b}-actions`)
      report.lambdas.push(`${app}-production-slack-${b}-options`)
    })
  }

  if (arc.scheduled) {
    report.lambdas = report.lambdas.concat(arc.scheduled.map(getScheduledName).reduce((a,b)=>a.concat(b)))
    report.types.scheduled = arc.scheduled.map(a=> a.shift())
  }

  if (arc.tables) {
    arc.tables.forEach(tbl=> {
      var tablename = getTableName(tbl)
      report.tables.push(`${app}-staging-${tablename}`)
      report.tables.push(`${app}-production-${tablename}`)
      var keys = Object.keys(tbl[tablename])
      var lambdas = keys.filter(k=> k === 'insert' || k === 'update' || k === 'destroy')
      lambdas.forEach(q=> {
        report.lambdas.push(`${app}-production-${tablename}-${q}`)
        report.lambdas.push(`${app}-staging-${tablename}-${q}`)
        report.types.tables.push(`${tablename}-${q}`)
      })
    })
  }

  if (arc.static) {
    report.s3buckets = [arc.static[0][1], arc.static[1][1]]
  }

  // pass off the data
  callback(null, report)
}
