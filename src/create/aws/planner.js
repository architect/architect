module.exports = function planner(arc) {

  var app = arc.app[0]
  var plans = [{action:'create-iam-role', app}]

  if (arc.events) {
    arc.events.forEach(event=> {
      plans.push({action:'create-events', event, app})
      plans.push({action:'create-event-lambda-code', event, app})
      plans.push({action:'create-event-lambda-deployments', event, app})
    })
  }

  if (arc.html) {
    arc.html.forEach(route=> {
      plans.push({action:'create-html-lambda-code', route, app})
      plans.push({action:'create-html-lambda-deployments', route, app})
    })
  }

  if (arc.static) {
    plans.push({action:'create-static-deployments', static:arc.static})
  }

  // build up a plan for json
  if (arc.json) {
    arc.json.forEach(route=> {
      plans.push({action:'create-json-lambda-code', route, app})
      plans.push({action:'create-json-lambda-deployments', route, app})
    })
  }

  // html and json are session enabled by default
  // which means: we create a sessions table by default
  // (arc-sessions; can override with SESSIONS_TABLE env var)
  if (!process.env.ARC_DISABLE_SESSION) {
    var sessions = arc.hasOwnProperty('json') || arc.hasOwnProperty('html')
    if (sessions) {
      var table = {
        'arc-sessions': {
          _idx: '*String',
          _ttl: 'TTL'
        }
      }
      plans.push({action:'create-tables', table, app})
    }
  }

  if (arc.tables) {
    arc.tables.forEach(table=> {
      plans.push({action:'create-tables', table, app})
      var name = Object.keys(table)[0]
      var hasInsert = table[name].hasOwnProperty('insert')
      var hasUpdate = table[name].hasOwnProperty('update')
      var hasDestroy = table[name].hasOwnProperty('destroy')
      var hasTrigger = hasInsert || hasUpdate || hasDestroy
      if (hasTrigger) {
        plans.push({action:'create-table-lambda-code', table, app})
        plans.push({action:'create-table-lambda-deployments', table, app})
      }
    })
  }

  // build up a plan for indexes
  if (arc.indexes) {
    arc.indexes.forEach(index=> {
      plans.push({action:'create-table-index', index, app})
    })
  }

  // build up a plan for scheduled
  if (arc.scheduled) {
    arc.scheduled.forEach(scheduled=> {
      plans.push({action:'create-scheduled-lambda-code', scheduled, app})
      plans.push({action:'create-scheduled-lambda-deployments', scheduled, app})
    })
  }

   // build up a plan for api gateway
  var api = arc.hasOwnProperty('json') || arc.hasOwnProperty('html') || arc.hasOwnProperty('slack')

  // first create api gateway restapis
  if (api) {
    plans.push({action:'create-routers', app})
  }

  // kickup any html routes
  if (arc.html) {
    arc.html.forEach(route=> {
      // html is configured for text/html: 200, 302, 403, 404, 500
      plans.push({action:'create-html-route', route, app})
    })
  }

  if (arc.json) {
    arc.json.forEach(route=> {
      // json is configured for appplication/json: 200, 201, 403, 404, 500
      plans.push({action:'create-json-route', route, app})
    })
  }

  if (arc.slack) {
    arc.slack.forEach(bot=> {
      plans.push({action:'create-slack-endpoints', bot, app})
    })
  }

  if (api) {
    // always deploy!
    plans.push({action:'create-router-deployments', app})
  }

  return plans
}
