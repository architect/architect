module.exports = function planner(arc) {

  // grab the app name
  let app = arc.app[0]
  let hasAPI = arc.hasOwnProperty('json')    ||
               arc.hasOwnProperty('html')    ||
               arc.hasOwnProperty('js')      ||
               arc.hasOwnProperty('css')     ||
               arc.hasOwnProperty('text')    ||
               arc.hasOwnProperty('xml')     ||
               arc.hasOwnProperty('jsonapi') ||
               arc.hasOwnProperty('http')    ||
               arc.hasOwnProperty('slack')


  // some default plans
  var plans = [
    {action:'create-iam-role', app},
    {action:'create-shared', app},
  ]

  //
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

  if (arc.json) {
    arc.json.forEach(route=> {
      plans.push({action:'create-json-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-json-lambda-deployments', route, app})
      }
    })
  }

  if (arc.html) {
    arc.html.forEach(route=> {
      plans.push({action:'create-html-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-html-lambda-deployments', route, app})
      }
    })
  }

  if (arc.js) {
    arc.js.forEach(route=> {
      plans.push({action:'create-js-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-js-lambda-deployments', route, app})
      }
    })
  }

  if (arc.css) {
    arc.css.forEach(route=> {
      plans.push({action:'create-css-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-css-lambda-deployments', route, app})
      }
    })
  }

  if (arc.text) {
    arc.text.forEach(route=> {
      plans.push({action:'create-text-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-text-lambda-deployments', route, app})
      }
    })
  }

  if (arc.xml) {
    arc.xml.forEach(route=> {
      plans.push({action:'create-xml-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-xml-lambda-deployments', route, app})
      }
    })
  }

  if (arc.jsonapi) {
    arc.jsonapi.forEach(route=> {
      plans.push({action:'create-jsonapi-lambda-code', route, app})
      if (!process.env.ARC_LOCAL) {
        plans.push({action:'create-jsonapi-lambda-deployments', route, app})
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
    if (arc.html) {
      arc.html.forEach(route=> {
        plans.push({action:'create-html-route', route, app})
      })
    }
    if (arc.json) {
      arc.json.forEach(route=> {
        plans.push({action:'create-json-route', route, app})
      })
    }
    if (arc.slack) {
      arc.slack.forEach(bot=> {
        plans.push({action:'create-slack-endpoints', bot, app})
      })
    }
    if (arc.js) {
      arc.js.forEach(route=> {
        plans.push({action:'create-js-route', route, app})
      })
    }
    if (arc.css) {
      arc.css.forEach(route=> {
        plans.push({action:'create-css-route', route, app})
      })
    }
    if (arc.text) {
      arc.text.forEach(route=> {
        plans.push({action:'create-text-route', route, app})
      })
    }
    if (arc.xml) {
      arc.xml.forEach(route=> {
        plans.push({action:'create-xml-route', route, app})
      })
    }
    if (arc.jsonapi) {
      arc.jsonapi.forEach(route=> {
        plans.push({action:'create-jsonapi-route', route, app})
      })
    }

    // always deploy!
    plans.push({action:'create-router-deployments', app})
  }

  return plans
}
