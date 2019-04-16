let regexp = require('../_regexp')
let Err = require('../_error-factory')
let getRuntime = require('../../../util/get-runtime')
let getLayers = require('../../../util/get-layers')

/**
 * aws
 * ---
 * validator for @aws
 *
 * - assert @aws layer is a valid layer
 * - assert @aws runtime is a valid runtime
 */
module.exports = function app(arc, raw) {
  var errors = []

  if (!arc.aws) return errors

  // Issue a warning if invalid runtime is found
  //   System will automatically default to a valid runtime
  if (arc.aws.some(tuple => tuple.includes('runtime'))) {
    let awsRuntime = arc.aws.find(tuple => tuple.includes('runtime'))
    getRuntime.allowed(awsRuntime)
  }

  // Validate layers
  let layers = getLayers(arc)

  // Check valid ARN
  if (Array.isArray(layers)) {
    layers.forEach(layer => {
      if (!regexp.layer.test(layer)) {
        errors.push(Err({
          message: `Layer is not a valid ARN`,
          linenumber: findLineNumber(layer, raw),
          raw,
          arc,
          detail: 'Layer should be a valid ARN',
        }))
      }
    })
  }

  // Ensure layers are in the correct region
  if (Array.isArray(layers)) {
    layers.forEach(layer => {
      let layerRegion = layer.split(':')[3]
      let arcRegion = process.env.AWS_REGION
      if (layerRegion !== arcRegion) {
        errors.push(Err({
          message: `Layers must be in the same region as Lambdas`,
          linenumber: findLineNumber(layer, raw),
          raw,
          arc,
          detail: 'Layer ARNs specify a region, this region must be the same as that of your Lambdas',
        }))
      }
    })
  }

  return errors
}

function findLineNumber(search, raw) {
  var lines = raw.split('\n')
  for (var i = 0; i <= lines.length; i++) {
    if (lines[i] && lines[i].includes(search)) {
      return i + 1
    }
  }
  return -1
}
