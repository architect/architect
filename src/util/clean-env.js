// enforce local guardrails (and more convenient)
// this still allows explicit override:
// NODE_ENV=staging npx sandbox  
module.exports = function cleanEnv(callback) {
  if (!process.env.hasOwnProperty('NODE_ENV')) {
    process.env.NODE_ENV = 'testing'
  }
  callback();
}
