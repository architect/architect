let test = require('tape')
let path = require('path')
let child = require('child_process')
let cmd = `node ${path.join(__dirname, '..', '..', 'src', 'index.js')}`

test('cli module exits without error and prints usage from the shell', t => {
  t.plan(2)
  child.exec(cmd, { shell: true }, function exec (err, stdout) {
    if (err) t.fail(err)
    else {
      t.ok(true, 'exited with non-zero code')
      t.match(stdout, /global commands/i, 'stdout includes the word "global commands"')
    }
  })
})
