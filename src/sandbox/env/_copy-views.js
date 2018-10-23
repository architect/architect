const fs = require('fs')
const chalk = require('chalk')
const glob = require('glob')
const path = require('path')
const mkdir = require('mkdirp').sync
const pattern = require('../../util/glob-lambdas')
const readArc = require('../../util/read-arc')

// Read .arc file
// Filter paths by @views from .arc file

/**
 * copies ./src/views into ./node_modules/@architect/views/
 */
module.exports = function _views (callback) {
  let src = path.join(process.cwd(), 'src', 'views')
  let files = glob.sync(src + '/**/*', { dot: true })
  let paths = glob.sync('src/@(http)/get-*')
  let parsed = readArc()

  console.log('ARC: ', parsed.arc)
  console.log('Paths: ', paths)
  console.log('src: ', src)

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
}
