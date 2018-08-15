#!/usr/bin/env node
let dns = require('.')

// default to dns.basic; nuke and route53 are opt in
let nuking = process.argv.length === 3 && process.argv[2] === 'nuke' // npx dns nuke
let deluxe = process.argv.length === 3 && process.argv[2] === 'route53' // npx dns route53
let exec = (nuking? dns.nuke : (deluxe? dns.route53 : dns.basic)) // npx dns

// always fail loudly and exit cleanly
exec(function _done(err) {
  if (err) console.log(err)
  process.exit(err? 1 : 0)
})
