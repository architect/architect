let test = require('tape')

let create = require('@architect/create')
let createCLI = require('@architect/create/src/cli')

let deploy = require('@architect/deploy')
let deployCLI = require('@architect/deploy/src/cli')

let env = require('@architect/env')

let hydrate = require('@architect/hydrate')
let hydrateCLI = require('@architect/hydrate/cli')

let logs = require('@architect/logs')
let logsCLI = require('@architect/logs/cli')

let sandbox = require('@architect/sandbox')
let sandboxCLI = require('@architect/sandbox/src/cli/arc')

let destroy = require('@architect/destroy')
let destroyCLI = require('@architect/destroy/src/cli')

test('Core Architect packages and necessary CLI interfaces are present', t => {
  t.plan(13)
  t.ok(create, 'create found')
  t.ok(createCLI, 'create CLI found')
  t.ok(deploy, 'deploy found')
  t.ok(deployCLI, 'deploy CLI found')
  t.ok(env, 'env found')
  t.ok(hydrate, 'hydrate found')
  t.ok(hydrateCLI, 'hydrate CLI found')
  t.ok(logs, 'logs found')
  t.ok(logsCLI, 'logs CLI found')
  t.ok(sandbox, 'sandbox found')
  t.ok(sandboxCLI, 'sandbox CLI found')
  t.ok(destroy, 'destroy found')
  t.ok(destroyCLI, 'destroy CLI found')
})
