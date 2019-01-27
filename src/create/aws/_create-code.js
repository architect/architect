let assert = require('@smallwins/validate/assert')
let path = require('path')
let mkdir = require('mkdirp').sync
let fs = require('fs')
let print = require('../_print')
let exists = require('path-exists').sync
let install = require('./_install-deps')

function getCodeFor({space, idx, arc}) {
  let extension = 'js'
  let runtime = arc.aws.find(t=> t[0] === 'runtime')
  if (runtime) {
    let val = runtime[1]
    let allowed = ['node', 'python', 'ruby']
    if (allowed.includes(val)) {
      if (val === 'python') extension = 'py'
      if (val === 'ruby') extension = 'rb'
    }
  }
  let file = `${space}.${extension}`
  let index = `index.${extension}`
  let code = path.join(__dirname, '..', 'templates', file)
  return {
    code: fs.readFileSync(code).toString(),
    index: path.join(process.cwd(), 'src', space, idx, index)
  }
}

module.exports = function _createCode(params, callback) {

  assert(params, {
    idx: String,
    space: String, // http, scheduled, events, queues, tables
    app: String,
    arc: Object,
  })

  let {idx, space, app, arc} = params

  // non destructive setup dir
  mkdir('src')
  mkdir(`src/${space}`)

  let absolutePath = path.join(process.cwd(), 'src', space, idx)
  let relativePath = path.join('src', space, idx)

  if (exists(absolutePath)) {
    print.skip(`@${space} Function`, `src/${space}/${idx}`)
    callback()
  }
  else {
    print.create(`@${space} Function`, `src/${space}/${idx}`)

    // make sure the dir exists
    mkdir(`src/${space}/${idx}`)

    // write in the index code
    let {index, code} = getCodeFor({space, idx, arc})
    fs.writeFileSync(index, code)

    // Install deps, then hydrate with shared code (if any)
    install({
      absolutePath,
      relativePath,
      arc,
      app,
      idx,
    }, callback)
  }
}
