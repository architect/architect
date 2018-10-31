#!/usr/bin/env node
let dns = require('.')

let command = process.argv.length === 3 && process.argv[2]

// default to dns.basic; nuke and route53 are opt in

// npx dns nuke
let nuking =  command === 'nuke' ||
              command === '--nuke' ||
              command === '-n'

// npx dns route53
let deluxe =  command === 'route53' ||
              command === '--route53' ||
              command === '-r'

// npx dns
let exec =  (nuking
              ? dns.nuke
              : (deluxe
                  ? dns.route53
                  : dns.basic))

// always fail loudly and exit cleanly
exec(function _done(err) {
  if (err) console.log(err)
  process.exit(err? 1 : 0)
})
