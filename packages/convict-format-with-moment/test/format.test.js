'use strict'

const moment = require('moment')
const convict = require('convict')
const convict_format_with_moment = require('../')

describe('convict formats', function() {
  let conf

  test('must add "duration" and "timestamp" format with convict-format-with-moment', function() {
    convict.addFormats(convict_format_with_moment)
  })

  test('must parse a config specification', function() {
    conf = convict({
      foo: {
        date: {
          format: 'timestamp',
          default: '2013-05-05'
        },
        duration: {
          format: 'duration',
          default: 604800000
        },
        duration2: {
          format: 'duration',
          default: '5 minutes'
        },
        duration3: {
          format: 'duration',
          default: '12345'
        },
        duration4: {
          format: 'duration',
          default: '12345'
        },
        duration5: {
          format: 'duration',
          default: '12345'
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
    conf.set('foo.duration4', '-7 days')
    expect(function() {
      conf.validate()
    }).toThrow(/must be a positive integer or human readable string/)

    conf.set('foo.duration5', 'zz-7zzdays')
    expect(function() {
      conf.validate()
    }).toThrow(/must be a positive integer or human readable string/)
  })

  describe('predefined formats', function() {

    test('must handle timestamp', function() {
      const val = conf.get('foo.date')
      expect(val).toBe(moment('2013-05-05').valueOf())
    })

    test('must handle duration in milliseconds', function() {
      expect(conf.get('foo.duration')).toBe(604800000)
    })

    test('must handle duration in a human readable string', function() {
      expect(conf.get('foo.duration2')).toBe(60 * 5 * 1000)
    })

    test('must handle duration in milliseconds as a string', function() {
      expect(conf.get('foo.duration3')).toBe(12345)
    })
  })

})
