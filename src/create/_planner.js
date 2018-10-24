module.exports = function planner(arc) {

  // grab the app name
  let app = arc.app[0]
  let hasAPI = arc.hasOwnProperty('http') || arc.hasOwnProperty('slack')


  // some default plans
  var plans = [
    {action:'create-iam-role', app},
    {action:'create-shared', app},
    {action:'create-public', app},
    {action:'create-views', app}
  ]

  // sns events
  if (arc.events) {
    arc.events.forEach(event=> {
      plans.push({action:'create-event-lambda-code', event, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-events', event, app})
        plans.push({action:'create-event-lambda-deployments', event, app})
      }
    })
  }

  // queue
  if (arc.queues) {
    arc.queues.forEach(queue=> {
      plans.push({action:'create-queue-lambda-code', queue, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-queue', queue, app})
        plans.push({action:'create-queue-lambda-deployments', queue, app})
      }
    })
  }

  // scheduled
  if (arc.scheduled) {
    arc.scheduled.forEach(scheduled=> {
      plans.push({action:'create-scheduled-lambda-code', scheduled, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-scheduled-lambda-deployments', scheduled, app})
      }
    })
  }

  // s3 buckets
  if (arc.static && !process.env.ARC_LOCAL) {
    plans.push({action:'create-static-deployments', static:arc.static})
  }

  //
  // http lambdas
  //
  if (arc.http) {
    arc.http.forEach(route=> {
      plans.push({action:'create-http-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-http-lambda-deployments', route, app})
      }
    })
  }

  //
  // dynamodb tables
  //

  // Sessions tables are created by default
  let createSessionTables = hasAPI && !process.env.ARC_DISABLE_SESSION && !process.env.ARC_LOCAL
  if (createSessionTables) {
    var table = {
      'arc-sessions': {
        _idx: '*String',
        _ttl: 'TTL',
      }
    }
    plans.push({action:'create-tables', table, app})
  }

  if (arc.tables) {
    arc.tables.forEach(table=> {
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-tables', table, app})
      }
      var name = Object.keys(table)[0]
      var hasInsert = table[name].hasOwnProperty('insert')
      var hasUpdate = table[name].hasOwnProperty('update')
      var hasDestroy = table[name].hasOwnProperty('destroy')
      var hasTrigger = hasInsert || hasUpdate || hasDestroy
      if (hasTrigger) {
        plans.push({action:'create-table-lambda-code', table, app})
        if (!process.env.ARC_LOCAL) {
          plans.push({action:'create-table-lambda-deployments', table, app})
        }
      }
    })
  }

  // build up a plan for indexes
  if (arc.indexes && !process.env.ARC_LOCAL) {
    arc.indexes.forEach(index=> {
      plans.push({action:'create-table-index', index, app})
    })
  }

  //
  // api gateway
  //
  if (hasAPI && !process.env.ARC_LOCAL) {

    plans.push({action:'create-routers', app})

    if (arc.http) {
      arc.http.forEach(route=> {
        plans.push({action:'create-http-route', route, app})
      })
    }

    // always deploy!
    plans.push({action:'create-router-deployments', app})
  }

  return plans
}
