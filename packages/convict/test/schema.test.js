'use strict'

const path = require('path')

const convict = require('../')

describe('convict schema', function() {

  let conf
  const conf2 = convict({
    foo: {
      none: {
        format: String,
        default: undefined
      }
    }
  })

  test('must parse a config specification from a file', function() {
    conf = convict(path.join(__dirname, 'schema.json'))
  })

  test('must parse a specification with built-in formats', function() {
    conf = convict(path.join(__dirname, 'cases/schema-built-in-formats.json'))
  })

  test('must throw when parsing a specification that reuses a command-line argument', function() {
    expect(function() {
      convict({
        foo: {default: 'a', arg: 'BAZ'},
        bar: {default: 'a', arg: 'BAZ'}
      })
    }).toThrow()
  })

  test('must accept process arguments and environment variables as parameters', function() {
    conf = convict({
      foo: {
        format: String,
        default: 'DEFAULT',
        env: 'FOO',
        arg: 'foo',
      },
      bar: {
        format: String,
        default: 'DEFAULT',
        env: 'BAR',
        arg: 'bar'
      }
    }, {args: ['--bar', 'baz'], env: {FOO: 'foz'}})
    expect(conf.getArgs()).toEqual(['--bar', 'baz'])
    expect(conf.getEnv()).toEqual({FOO: 'foz'})
    expect(conf.get('bar')).toBe('baz')
    expect(conf.get('foo')).toBe('foz')
  })

  describe('after being parsed', function() {

    beforeEach(function() {
      conf = convict(path.join(__dirname, 'schema.json'))
    })

    test('must be valid', function() {
      expect(function() {
        conf.validate()
      }).not.toThrow()
    })

    test('must be valid again', function() {
      expect(function() {
        conf2.validate()
      }).not.toThrow()
    })

    test('must export all its properties as JSON', function() {
      const res = conf.getProperties()
      expect(res).toEqual({
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
    })

    test('must export all its properties as a string', function() {
      const res = conf.toString()
      expect(res).toEqual(JSON.stringify({
        foo: {
          bar: 7,
          baz: {
            bing: 'foo',
            'name with spaces': {
              name_with_underscores: true
            }
          }
        }
      }, null, 2))
    })

    test('must throw if `_cvtProperties` (reserved keyword) is used', function() {
      expect(function() {
        conf = convict({
          _cvtProperties: {
            format: String,
            default: 'DEFAULT'
          }
        })
      }).toThrow()
    })

    test('must export the schema as JSON', function() {
      const res = conf.getSchema()
      expect(res).toEqual({
        _cvtProperties: {
          foo: {
            _cvtProperties: {
              bar: {
                default: 7
              },
              baz: {
                _cvtProperties: {
                  bing: {
                    default: 'foo'
                  },
                  'name with spaces': {
                    _cvtProperties: {
                      name_with_underscores: {
                        default: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    })

    test('must export the schema as a JSON string', function() {
      const res = conf.getSchemaString()
      expect(res).toEqual(JSON.stringify({
        _cvtProperties: {
          foo: {
            _cvtProperties: {
              bar: {
                default: 7
              },
              baz: {
                _cvtProperties: {
                  bing: {
                    default: 'foo'
                  },
                  'name with spaces': {
                    _cvtProperties: {
                      name_with_underscores: {
                        default: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }, null, 2))
    })

    describe('.has()', function() {

      test('must not have undefined properties', function() {
        const val = conf.has('foo.bar.madeup')
        expect(val).toBe(false)
      })

      test('must not have properties specified with a default of undefined', function() {
        const val = conf2.has('foo.none')
        expect(val).toBe(false)
      })

    })

    describe('.get()', function() {

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

      test('must throw if conf doesn\'t exist', function() {
        expect(function() {
          conf.get('foo.no')
        }).toThrow()
      })
    })

    describe('.default()', function() {

      // Temporarily modify a property while testing default()
      beforeEach(function() {
        conf.set('foo.bar', 8)
      })
      afterEach(function() {
        conf.set('foo.bar', 7)
      })

      test('must report the default value of a property', function() {
        expect(conf.get('foo.bar')).toBe(8) // Modified
        expect(conf.default('foo.bar')).toBe(7)
        expect(conf.get('foo.bar')).toBe(8)
      })

      test('must throw if key doesn\'t exist', function() {
        expect(function() {
          conf.default('foo.no')
        }).toThrow()
      })

      describe('when acting on an Object property', function() {

        beforeEach(function() {
          conf = convict(path.join(__dirname, 'cases/schema-built-in-formats.json'))
        })

        test('must report the default value of the property', function() {
          expect(conf.get('someObject')).toEqual({})
          expect(conf.default('someObject')).toEqual({})
        })

        test('must not be altered by calls to .set()', function() {
          conf.set('someObject.five', 5)
          expect(conf.default('someObject')).toEqual({})
          expect(function() {
            conf.default('someObject.five')
          }).toThrow()
        })

        test('must not be altered by calls to .load()', function() {
          conf.load({someObject: {five: 5}})
          expect(conf.default('someObject')).toEqual({})
          expect(function() {
            conf.default('someObject.five')
          }).toThrow()
        })
      })

    })

    describe('.reset()', function() {

      // Temporarily modify a property while testing default()
      beforeEach(function() {
        conf.set('foo.bar', 8)
      })
      afterEach(function() {
        conf.set('foo.bar', 7)
      })

      test('must reset the property to its default value', function() {
        expect(conf.get('foo.bar')).toBe(8) // Modified
        conf.reset('foo.bar')
        expect(conf.get('foo.bar')).toBe(7)
      })

      test('must throw if key doesn\'t exist', function() {
        expect(function() {
          conf.reset('foo.no')
        }).toThrow()
      })
    })

  })

})

describe('convict used multiple times on one schema', function() {
  const schema = {
    publicServerAddress:  {
      doc: 'The public-facing server address',
      format: String,
      default: 'localhost:5000'
    }
  }
  expect(function() {
    convict(schema)
    convict(schema)
  }).not.toThrow()
})
