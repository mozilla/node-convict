'use strict'

const convict = require('../')

describe('deep nested tree structure', function() {
  let conf

  test('must parse a deep nested config specification', function() {
    conf = convict({
      db: {
        name: {
          format: String,
          default: ''
        },
        synchro: {
          active: {
            format: 'Boolean',
            default: false
          },
          foo: {
            format: String,
            default: 'abcd'
          }
        }
      }
    })
  })

  test('instance must be valid', function() {
    conf.load({
      db: {
        name: 'some_db',
        synchro: {
          active: true,
          foo: 'xyz'
        }
      }
    })
    expect(function() {
      conf.validate({
        allowed: 'strict'
      })
    }).not.toThrow()
  })

  describe('get nested fields value', function() {

    test('must find a value', function() {
      expect(function() {
        conf.get('db')
      }).not.toThrow()
    })

    test('must handle two levels of nesting', function() {
      expect(conf.get('db.name')).toBe('some_db')
    })

    test('must handle three levels of nesting', function() {
      expect(conf.get('db.synchro.active')).toBe(true)
    })

    test('must handle three levels of side by side nesting', function() {
      expect(conf.get('db.synchro.foo')).toBe('xyz')
    })

  })

  describe('alter nested fields value', function() {
    let synchro

    test('must find a nested value', function() {
      expect(function() {
        synchro = conf.get('db.synchro')
      }).not.toThrow()
    })

    test('modify a nested value and must be valid', function() {
      synchro.active = false
      conf.set('db.synchro', synchro)
      expect(function() {
        conf.validate({
          allowed: 'strict'
        })
      }).not.toThrow()
      expect(conf.get('db.synchro.active')).toBe(false)
    })

  })

  describe('alter deep nested fields value', function() {
    let db

    test('must find a deep nested value', function() {
      expect(function() {
        db = conf.get('db')
      }).not.toThrow()
    })

    test('modify a deep nested value and must be valid', function() {
      db.synchro.foo = 'mnopq'
      conf.set('db', db)
      expect(function() {
        conf.validate({
          allowed: 'strict'
        })
      }).not.toThrow()
      expect(conf.get('db.synchro.foo')).toBe('mnopq')
    })

  })

  describe('missing chains', function() {

    test('must error when attempting to access a missing chain', function() {
      expect(function() {
        conf.get('invalid')
      }).toThrow()
      expect(function() {
        conf.get('invalid.child')
      }).toThrow()
    })

    test('must initialize an empty chain', function() {
      expect(function() {
        conf.set('invalid.child', 'value')
      }).not.toThrow()
    })

    test('must retrieve an initialized empty chain', function() {
      expect(conf.get('invalid.child')).toBe('value')
      expect(conf.get('invalid')).toEqual({child: 'value'})
    })

  })

})
