'use strict'

const convict = require('../')

const conf = convict({
  quux: {
    format: ['bar', 'baz', 'foo'],
    default: 'bar',
    env: 'QUUX'
  },
  foo: {
    bar: 7,
    baz: {
      bing: 'foo',
      'name with spaces': {
        name_with_underscores: true
      }
    }
  }
})

describe('convict get()', function() {

  test('must be valid', function() {
    expect(function() {
      conf.validate()
    }).not.toThrow()
  })

  test('must find a nested value', function() {
    const val = conf.get('foo.bar')
    expect(val).toBe(7)
  })

  test('must handle three levels of nesting', function() {
    expect(conf.get('foo.baz.bing')).toBe('foo')
  })

  test('must handle names with spaces and underscores', function() {
    expect(conf.get('foo.baz.name with spaces.name_with_underscores')).toBe(true)
  })

  test("must throw if conf doesn't exist", function() {
    expect(function() {
      conf.get('foo.no')
    }).toThrow()
  })

  test('must get quux', function() {
    const val = conf.get('quux')
    expect(val).toBe('bar')
  })

})
