'use strict'

const convict = require('convict')

describe('convict formats', function() {
  let conf

  test('must add formats ("email", "ipaddress" and "url") with convict-format-with-validator', function() {
    convict.addFormats(require('../'))
  })

  test('must parse a config specification', function() {
    conf = convict({
      foo: {
        host: {
          format: 'ipaddress',
          default: '127.0.0.1'
        },
        email: {
          format: 'email',
          default: 'foo@bar.com'
        },
        url: {
          format: 'url',
          default: 'http://example.com'
        }
      }
    })
  })

  test('validates default schema', function() {
    expect(function() {
      conf.validate()
    }).not.toThrow()
  })

  test('successfully fails to validate incorrect values', function() {
    conf.set('foo.email', ';aaaa;')
    expect(function() {
      conf.validate()
    }).toThrow(/must be an email address: value was ";aaaa;"/)
  })

})
