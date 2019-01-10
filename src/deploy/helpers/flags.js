let chalk = require('chalk')

// module instead (easier to test / better encapsulation)
module.exports = function flags(start) {

  // returns a function that expects to recieve the output of util/init
  return function(arc, raw, callback) {

    // sekret speed tweak
    if (process.env.PARALLEL_DEPLOYS_PER_SECOND) {
      let check = chalk.green.dim('✓')
      let msg = chalk.grey(`Parallel deploys per second: ${process.env.PARALLEL_DEPLOYS_PER_SECOND}\n`)
      console.log(check, msg)
    }

    // grab userland args
    let args = process.argv.slice(2)

    // we have args! time to figure out env
    let isProd = process.env.ARC_DEPLOY === 'production' ||
                 args.includes('production') ||
                 args.includes('--production')

    let env = isProd? 'production' : 'staging'

    // final override
    process.env.ARC_DEPLOY = env

    // now figure out what we intend to deploy
    let isStatic = args.includes('static') ||
                   args.includes('--static') ||
                   args.includes('public') ||
                   args.includes('--public') ||
                   args.includes('/public')

    // should we delete static assets not present locally under public/
    let shouldDelete = args.includes('--delete')

    let isPath = args.some(arg=> arg.startsWith('/') ||
                 arg.startsWith('src'))

    let isLambda = args.includes('lambda') ||
                   args.includes('--lambda') ||
                   args.includes('lambdas') ||
                   args.includes('--lambdas') ||
                   args.includes('functions') ||
                   args.includes('--functions')

    // filter function deployment by type
    let filters = []
    if (args.includes('http'))
      filters.push('http')
    if (args.includes('ws'))
      filters.push('ws')
    if (args.includes('scheduled'))
      filters.push('scheduled')
    if (args.includes('queues'))
      filters.push('queues')
    if (args.includes('events'))
      filters.push('events')
    if (args.includes('tables'))
      filters.push('tables')

    //callback(null, arc, raw, {isProd, env, isStatic, isPath, isLambda, start, all: args}, callback)
    callback(null, arc, raw, {
      isProd,
      env,
      isStatic,
      isPath,
      isLambda,
      filters,
      shouldDelete,
      start,
      all: args
    })
  }
}

