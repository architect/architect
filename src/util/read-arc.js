let parse = require('@architect/parser')
let fs = require('fs')
let read = p=> fs.readFileSync(p).toString()
let join = require('path').join
let exists = require('path-exists').sync
let err = require('./init/_err')

/**
 * lookup .arc
 *   fallback to arc.yaml
 *      failing that fallback to arc.json
 */
module.exports = function readArc(params={}) {

  let cwd = params.cwd? params.cwd : process.cwd()

  let arcDefaultPath = join(cwd, '.arc')
  let arcYamlPath = join(cwd, 'arc.yaml')
  let arcJsonPath = join(cwd, 'arc.json')

  let raw
  let arc
  try {
    if (exists(arcDefaultPath)) {
      raw = read(arcDefaultPath)
      arc = parse(raw)
    }
    else if (exists(arcYamlPath)) {
      raw = read(arcYamlPath)
      arc = parse.yaml(raw)
      // HACK
      raw = parse.yaml.stringify(raw)
    }
    else if (exists(arcJsonPath)) {
      raw = read(arcJsonPath)
      arc = parse.json(raw)
      // HACK
      raw = parse.json.stringify(raw)
    }
    else {
      throw Error('.arc, arc.yaml or arc.json not found')
    }
  }
  catch(e) {
    err(e.message)
    process.exit(1)
  }

  return {raw, arc}
}
