let getLambdaName = require('../util/get-lambda-name')
let getLegacyLambdaName = require('../util/get-legacy-lambda-name')
let path = require('path')
let readArc = require('../util/read-arc')

/**
 * {
 *   TODO cloudwatch rules
 *   TODO add SSM Params used by env
 *   TODO additional iam roles
 * }
 */
module.exports = function inventory(arc, raw, callback) {

  if (!arc) {
    let parsed = readArc()
    arc = parsed.arc
    raw = parsed.raw
  }

  let app = arc.app[0]

  let report = {
    app,
    restapis: [
      `${app}-staging`,
      `${app}-production`,
    ],
    websocketapis: [],
    lambdas: [],
    types: {
      http:[],
      ws:[],
      events:[],
      queues:[],
      scheduled:[],
      slack:[],
      tables:[],
      /*deprec*/
      css:[],
      html:[],
      js:[],
      json:[],
      text:[],
      xml:[],
    },
    iamroles: ['arc-role'],
    snstopics: [],
    sqstopics: [],
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
    if (type === 'scheduled') {
      return ['src', type, tuple[0]]
    }
    else if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = getLambdaName(tuple[1])
      return ['src', type, `${verb}${path}`]
    }
    else {
      return ['src', type, tuple]
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
    var name = arr.slice(0).shift()
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
      return path.join.apply({}, getPath('http', tuple))
    })
  }

  if (arc.ws) {
    report.websocketapis = [
      `${arc.app}-ws-staging`,
      `${arc.app}-ws-production`,
    ]
    report.lambdas = report.lambdas.concat([
      `${arc.app}-staging-ws-default`,
      `${arc.app}-staging-ws-connect`,
      `${arc.app}-staging-ws-disconnect`,
      `${arc.app}-production-ws-default`,
      `${arc.app}-production-ws-connect`,
      `${arc.app}-production-ws-disconnect`,
    ])
    report.types.ws = [
      'ws-default',
      'ws-connect',
      'ws-disconnect',
    ]
    report.localPaths = report.localPaths.concat([
      path.join('src', 'ws', 'ws-default'),
      path.join('src', 'ws', 'ws-connect'),
      path.join('src', 'ws', 'ws-disconnect'),
    ])
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
    report.localPaths = report.localPaths.concat(arc.events.map(function fmt(tuple) {
      return path.join.apply({}, getPath('events', tuple))
    }))
  }

  if (arc.queues && arc.queues.length > 0) {
    report.lambdas = report.lambdas.concat(arc.queues.map(getEventName).reduce((a,b)=>a.concat(b)))
    report.types.queues = arc.queues.slice(0)
    arc.queues.forEach(e=> {
      report.sqstopics.push(`${app}-staging-${e}`)
      report.sqstopics.push(`${app}-production-${e}`)
    })
    report.localPaths = report.localPaths.concat(arc.queues.map(function fmt(tuple) {
      return path.join.apply({}, getPath('queues', tuple))
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
      report.localPaths.push(path.join('src', 'scheduled', `${b}-events`))
      report.localPaths.push(path.join('src', 'scheduled', `${b}-slash`))
      report.localPaths.push(path.join('src', 'scheduled', `${b}-actions`))
      report.localPaths.push(path.join('src', 'scheduled', `${b}-options`))
    })
  }

  if (arc.scheduled) {
    let scheds = arc.scheduled.map(getScheduledName).slice(0).reduce((a,b)=>a.concat(b))
    report.lambdas = report.lambdas.concat(scheds)
    report.types.scheduled = arc.scheduled.map(a=> a[0])
    report.localPaths = report.localPaths.concat(arc.scheduled.map(function fmt(tuple) {
      return path.join.apply({}, getPath('scheduled', tuple))
    }))
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
      report.localPaths = report.localPaths.concat(lambdas.map(function fmt(q) {
        return path.join.apply({}, getPath('tables', `${tablename}-${q}`))
      }))
    })
  }

  if (arc.static) {
    report.s3buckets = [arc.static[0][1], arc.static[1][1]]
  }

  // pass off the data
  callback(null, report)
}
