let node = require('./node')
let python = require('./python')
let ruby = require('./ruby')

/**
 * runtime dependency systems abstraction
 *
 * each runtime implements:
 *
 * - create(params, callback) .... project init used by `npx create`
 * - install(params, callback) ... project install used by `npx hydrate`
 * - update(params, callback) ....  project update used by `npx hydrate update`
 *
 */
module.exports  = {node, python, ruby}
