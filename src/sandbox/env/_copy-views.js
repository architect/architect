let fs = require('fs')
let chalk = require('chalk')
let glob = require('glob')
let path = require('path')
let mkdir = require('mkdirp').sync
let pattern = require('../../util/glob-lambdas')
// Read .arc file
// Filter paths by @views from .arc file

/**
 * copies ./src/views into ./node_modules/@architect/views/
 */
module.exports = function _views (callback) {
  let src = path.join(process.cwd(), 'src', 'views')
  let files = glob.sync(src + '/**/*', { dot: true })
  let paths = glob.sync('src/@(text|html|http|js|css|xml)/*')

  console.log('Paths: ', paths)

  /*
  files.forEach(f => {
    paths.forEach(pathToCode => {
      let dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'views')
      let current = f.replace(src, dest)
      mkdir(dest)
      if (fs.statSync(f).isDirectory()) {
        mkdir(current)
      } else {
        fs.copyFileSync(f, current)
      }
    })
  })
  console.log(chalk.dim(chalk.green.dim('✓'), 'src/views copied to lambda node_modules/@architect/views'))
  callback()
  */
  callback()
}
