const arc = require('@architect/eslint-config')

module.exports = [
  ...arc,
  {
    ignores: [
      '.nyc_output/',
      'coverage/',
      'node_modules/',
    ],
  },
]
