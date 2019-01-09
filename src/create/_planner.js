module.exports = function planner(arc) {

  // we'll keep references to the arc plan here
  let plans = []

  // grab the app name
  let app = arc.app[0]

  //
  // default cloud required plans
  //
  if (!process.env.ARC_LOCAL) {
    plans.push({action:'create-iam-role', app})
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
  // event lambdas
  //
  if (arc.events) {
    arc.events.forEach(event=> {
      plans.push({action:'create-event-lambda-code', event, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-events', event, app})
        plans.push({action:'create-event-lambda-deployments', event, app})
      }
    })
  }

  //
  // queue lambdas
  //
  if (arc.queues) {
    arc.queues.forEach(queue=> {
      plans.push({action:'create-queue-lambda-code', queue, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-queue', queue, app})
        plans.push({action:'create-queue-lambda-deployments', queue, app})
      }
    })
  }

  //
  // scheduled lambdas
  //
  if (arc.scheduled) {
    arc.scheduled.forEach(scheduled=> {
      plans.push({action:'create-scheduled-lambda-code', scheduled, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-scheduled-lambda-deployments', scheduled, app})
      }
    })
  }

  //
  // s3 buckets
  //
  if (arc.static && !process.env.ARC_LOCAL) {
    plans.push({action:'create-static-deployments', static:arc.static})
  }

  //
  // slack api endpoints
  //
  if (arc.slack && !process.env.ARC_LOCAL) {
    arc.slack.forEach(bot=> {
      plans.push({action:'create-slack-endpoints', bot, app})
    })
  }

  //
  // dynamo tables
  //
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
  // api gateway http
  //
  let hasAPI = arc.hasOwnProperty('http') || arc.hasOwnProperty('slack')
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


  //
  // api gateway web sockets
  //
  if (arc.hasOwnProperty('ws')) {
    plans.push({action:'create-ws-lambda-code', app, name:'ws-connect'})
    plans.push({action:'create-ws-lambda-code', app, name:'ws-disconnect'})
    plans.push({action:'create-ws-lambda-code', app, name:'ws-default'})
    if (!process.env.ARC_LOCAL) {
      plans.push({action:'create-ws-lambda-deployments', app, name:'ws-connect'})
      plans.push({action:'create-ws-lambda-deployments', app, name:'ws-disconnect'})
      plans.push({action:'create-ws-lambda-deployments', app, name:'ws-default'})
      plans.push({action:'create-ws-router', app})
      plans.push({action:'create-ws-router-deployments', app})
    }
  }

  return plans
}
