let parse = require('@architect/parser')
let fs = require('fs')
let chalk = require('chalk')
let glob = require('glob')
let path = require('path')
let exists = require('path-exists').sync
let mkdir = require('mkdirp').sync
let pattern = require('../../util/glob-lambdas')

/**
 * copies ./.arc into ./node_modules/@architect/shared/.arc
 */
module.exports = function _copyArc(callback) {

  let arcDefaultPath = path.join(process.cwd(), '.arc')
  let arcYamlPath = path.join(process.cwd(), 'arc.yaml')
  let arcJsonPath = path.join(process.cwd(), 'arc.json')

  let paths = glob.sync(pattern)
  paths.forEach(pathToCode=> {

    // create architect/shared if it does not yet exist
    let base =  path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
    mkdir(base)

    // destination for the lambda .arc copy
    let dest = path.join(base, '.arc')

    // copy in .arc
    if (exists(arcDefaultPath)) {
      fs.copyFileSync(arcDefaultPath, dest)
    }
    else if (exists(arcYamlPath)) {
      // write .arc from arc.yaml
      let raw = fs.readFileSync(arcYamlPath).toString()
      let arc = parse.yaml.stringify(raw)
      fs.writeFileSync(dest, arc)
    }
    else if (exists(arcJsonPath)) {
      // write .arc from arc.json
      let raw = fs.readFileSync(arcJsonPath).toString()
      let arc = parse.json.stringify(raw)
      fs.writeFileSync(dest, arc)
    }

  })
  console.log(chalk.dim(chalk.green.dim('✓'), '.arc copied to lambda node_modules/@architect/shared/.arc'))
  callback()
}
