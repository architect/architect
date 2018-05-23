let parse = require('@architect/parser')
let fs = require('fs')

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
 *   TODO @domain certs
 *   TODO @domain recordsets
 *   TODO cloudwatch rules
 * }
 */
module.exports = function inventory(arcFilePath, callback) {

  let arc = parse(fs.readFileSync(arcFilePath).toString())
  let app = arc.app[0]

  let report = {
    app,
    restapis: [
      `${app}-staging`,
      `${app}-production`,
    ],
    lambdas: [],
    iamroles: ['arc-role'],
    snstopics: [],
    s3buckets: [],
    tables: [],
  }

  // gets an http lambda name
  function getName(tuple) {
    if (Array.isArray(tuple)) {
      var verb = tuple[0]
      var path = tuple[1] === '/'? '-index': tuple[1].replace(/\//g, '-').replace('.', '-').replace(/:/g, '000')
      return [`${app}-production-${verb}${path}`, `${app}-staging-${verb}${path}`]
    }
    else {
      var path = tuple.replace(/\//g, '-').replace('.', '-').replace(/:/g, '000')
      return [`${app}-production-get${path}`, `${app}-staging-get${path}`]
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

  if (arc.html && arc.html.length > 0) {
    report.lambdas = arc.html.map(getName).reduce((a,b)=>a.concat(b))
  }

  if (arc.json && arc.json.length > 0) {
    report.lambdas = report.lambdas.concat(arc.json.map(getName).reduce((a,b)=>a.concat(b)))
  }

  if (arc.js && arc.js.length > 0) {
    report.lambdas = report.lambdas.concat(arc.js.map(getName).reduce((a,b)=>a.concat(b)))
  }

  if (arc.css && arc.css.length > 0) {
    report.lambdas = report.lambdas.concat(arc.css.map(getName).reduce((a,b)=>a.concat(b)))
  }

  if (arc.text && arc.text.length > 0) {
    report.lambdas = report.lambdas.concat(arc.text.map(getName).reduce((a,b)=>a.concat(b)))
  }

  if (arc.xml && arc.xml.length > 0) {
    report.lambdas = report.lambdas.concat(arc.xml.map(getName).reduce((a,b)=>a.concat(b)))
  }
  // TODO arc.jsonapi

  if (arc.events && arc.events.length > 0) {
    report.lambdas = report.lambdas.concat(arc.events.map(getEventName).reduce((a,b)=>a.concat(b)))
    arc.events.forEach(e=> {
      report.snstopics.push(`${app}-staging-${e}`)
      report.snstopics.push(`${app}-production-${e}`)
    })
  }

  if (arc.slack) {
    arc.slack.forEach(b=> {
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
      })
    })
  }

  if (arc.static) {
    report.s3buckets = [arc.static[0][1], arc.static[1][1]]
  }

  // pass off the data
  callback(null, report)
}
