let fs = require('fs')
let chalk = require('chalk')
let glob = require('glob')
let path = require('path')
let mkdir = require('mkdirp').sync

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 * FIXME massive perf improvements can be made here
 */
module.exports = function _shared(callback) {

  let src = path.join(process.cwd(), 'src', 'shared')
  let files = glob.sync(src + '/**/*', {dot:true})
  let paths = glob.sync('src/@(html|json|js|css|events|scheduled|tables|slack)/*')

  files.forEach(f=> {
    paths.forEach(pathToCode=> {
      let dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
      let current = f.replace(src, dest)
      mkdir(dest)
      if (fs.statSync(f).isDirectory()) {
        mkdir(current)
      }
      else {
        fs.copyFileSync(f, current)
      }
    })
  })
  console.log(chalk.dim(chalk.green.dim('✓'), 'src/shared copied to lambda node_modules/@architect/shared'))
  callback()
}

