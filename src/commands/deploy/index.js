let deploy = require('@architect/deploy')
let validate = require('./validate')

/**
 * `arc deploy`
 *
 * deploys the current .arc as a sam application to AppNameStaging stack
 *
 * options
 * -p|--production|production ... deploys to AppNameProduction
 * -d|--dirty|dirty ............. *staging only* dirty deploy function code/config
 * -s|--static|static ........... dirty deploys /public to s3 bucket
 * -v|--verbose|verbose ......... prints all output to console
 */
let isDirty = opt=> opt === 'dirty' || opt === '--dirty' || opt === '-d'
let isStatic = opt=> opt === 'static' || opt === '--static' || opt === '-s'
let isProd = opt=> opt === 'production' || opt === '--production' || opt === '-p'
let isVerbose = opt=> opt === 'verbose' || opt === '--verbose' || opt === '-v'

module.exports = async function deployCommand(opts=[]) {

  validate(opts)

  let args = { verbose: opts.some(isVerbose), production: opts.some(isProd) }

  if (opts.some(isDirty))
    return deploy.dirty()

  if (opts.some(isStatic))
    return deploy.static(args)

  return deploy.sam(args)
}
