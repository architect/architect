let chalk = require('chalk')

// TODO: move process touching from here to cli.js? have cli pass args into this
// module instead (easier to test / better encapsulation)
module.exports = function (start) { return function(arc, raw, callback) {
  // sekret speed tweak
  if (process.env.PARALLEL_DEPLOYS_PER_SECOND) {
    let check = chalk.green.dim('✓')
    let msg = chalk.grey(`Parallel deploys per second: ${process.env.PARALLEL_DEPLOYS_PER_SECOND}\n`)
    console.log(check, msg)
  }
  // grab userland args
  let args = process.argv.slice(2)

  // we have args! time to figure out env
  let isProd =    process.env.ARC_DEPLOY === 'production' ||
                  args.includes('production') ||
                  args.includes('--production')
  let env = isProd? 'production' : 'staging'
  process.env.ARC_DEPLOY = env // final override

  // now figure out what we intend to deploy
  let isStatic =  args.includes('static') ||
                  args.includes('--static') ||
                  args.includes('public') ||
                  args.includes('--public') ||
                  args.includes('/public')
  let isPath =    args.some(arg=> arg.startsWith('/') ||
                  arg.startsWith('src'))
  let isLambda =  args.includes('lambda') ||
                  args.includes('--lambda') ||
                  args.includes('lambdas') ||
                  args.includes('--lambdas') ||
                  args.includes('functions') ||
                  args.includes('--functions')
  callback(null, arc, raw, {isProd, env, isStatic, isPath, isLambda, start, all: args}, callback);
} }
