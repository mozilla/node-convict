'use strict'

exports.conf = {
  foo: {
    default: 'a',
    format: String,
    arg: 'foo'
  },
  port: {
    default: 0,
    format: 'port',
    arg: 'port'
  }
}

exports.argv = '--foo bar --port 8080'
