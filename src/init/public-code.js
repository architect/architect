let parallel = require('run-parallel')
let fs = require('fs')
let mkdir = require('mkdirp').sync
let {join} = require('path')

let html = `<!doctype html>
<html>
<head>
<link rel=stylesheet type=text/css href=index.css>
</head>
<body>

hello world from static index.html

</body>
<script type=module src=index.js></script>
</html>`

let css = 'body {background: pink};'

let mjs = 'console.log("hello world from clientside js")'

/**
 * generates
 * - public/index.html
 * - public/index.css
 * - public/index.js
 */
module.exports = function assets(callback) {
  let publicPath = join(process.cwd(), 'public')
  if (fs.existsSync(publicPath)) {
    callback()
  }
  else {
    mkdir(publicPath)
    parallel([
      fs.writeFile.bind({}, join('public', 'index.html'), html),
      fs.writeFile.bind({}, join('public', 'index.css'), css),
      fs.writeFile.bind({}, join('public', 'index.js'), mjs),
    ], callback)
  }
}
