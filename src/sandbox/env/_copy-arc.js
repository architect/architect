let fs = require('fs')
let chalk = require('chalk')
let glob = require('glob')
let path = require('path')
let mkdir = require('mkdirp').sync

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _copyArc(callback) {
  let src = path.join(process.cwd(), '.arc')
  let paths = glob.sync('src/@(html|json|events|scheduled|tables|slack)/*')
  paths.forEach(pathToCode=> {
    let base =  path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
    mkdir(base)
    let dest = path.join(base, '.arc')
    fs.copyFileSync(src, dest)
  })
  console.log(chalk.dim(chalk.green.dim('✓'), '.arc copied to lambda node_modules/@architect/shared/.arc'))
  callback()
}
