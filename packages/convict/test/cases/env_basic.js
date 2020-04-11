'use strict'

exports.conf = {
  foo: {
    default: 'a',
    format: String,
    env: 'FOO',
  },
  port: {
    default: 0,
    format: 'port',
    env: 'PORT'
  }
}

exports.env = {
  FOO: 'Yoyodyne',
  PORT: 8080
}
