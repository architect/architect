
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
      plans.push({action:'create-http-lambda-code', route, app, arc})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-http-lambda-deployments', route, app, arc})
      }
    })
  }

  //
  // event lambdas
  //
  if (arc.events) {
    arc.events.forEach(event=> {
      plans.push({action:'create-event-lambda-code', event, app, arc})
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
      plans.push({action:'create-queue-lambda-code', queue, app, arc})
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
      plans.push({action:'create-scheduled-lambda-code', scheduled, app, arc})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-scheduled-lambda-deployments', scheduled, app})
      }
    })
  }

  //
  // s3 buckets
  //
  if (arc.static && !process.env.ARC_LOCAL) {
    plans.push({action:'create-http-static-deployments', static:arc.static})
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
        plans.push({action:'create-table-lambda-code', table, app, arc})
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
  let hasAPI = arc.hasOwnProperty('http')
  if (hasAPI && !process.env.ARC_LOCAL) {
    plans.push({action:'create-http-routers', app})
    arc.http.forEach(route=> {
      plans.push({action:'create-http-route', route, app})
    })
    plans.push({action:'create-http-router-deployments', app})
  }


  //
  // api gateway web sockets
  //
  if (arc.hasOwnProperty('ws')) {
    plans.push({action:'create-ws-lambda-code', app, arc, name:'ws-connect'})
    plans.push({action:'create-ws-lambda-code', app, arc, name:'ws-disconnect'})
    plans.push({action:'create-ws-lambda-code', app, arc, name:'ws-default'})
    if (!process.env.ARC_LOCAL) {
      plans.push({action:'create-ws-lambda-deployments', app, name:'ws-connect'})
      plans.push({action:'create-ws-lambda-deployments', app, name:'ws-disconnect'})
      plans.push({action:'create-ws-lambda-deployments', app, name:'ws-default'})
      plans.push({action:'create-ws-router', app})
      plans.push({action:'create-ws-router-deployments', app})
    }
  }


  //
  // report
  //
  plans.push({action:'report', arc})
  return plans
}
