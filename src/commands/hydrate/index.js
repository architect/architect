let hydrate = require('@architect/hydrate')

module.exports = async function hydration(/*opts*/) {
  await hydrate({install:true})
}
