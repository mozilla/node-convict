'use strict'

module.exports = {
  collectCoverageFrom: [
    '**/lib/**',
    '!**/test/**',
  ],
  coverageDirectory: '/tmp/coverage-convict',
}
