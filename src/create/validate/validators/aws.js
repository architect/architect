let regexp = require('../_regexp')
let Err = require('../_error-factory')
let getRuntime = require('../../../util/get-runtime')
let getLayers = require('../../../util/get-layers')
let validRuntimes = getRuntime.validRuntimes

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

  // Validate runtime
  let runtime = getRuntime(arc)

  if (!validRuntimes.includes(runtime)) {
    errors.push(Err({
      message: 'runtime is not supported',
      arc,
      raw,
      linenumber: findLineNumber(runtime, raw),
      detail: 'supported runtimes: ' + validRuntimes.join(', ')
    }))
  }

  // Validate layers
  let layers = getLayers(arc)

  if (Array.isArray(layers)) {
    layers.forEach(layer => {
      if (!regexp.layer.test(layer)) {
        errors.push(Err({
          message: `layer is not a valid arn`,
          linenumber: findLineNumber(layer, raw),
          raw,
          arc,
          detail: 'layer should be a valid arn',
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
