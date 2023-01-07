'use strict'

describe('convict formats', function() {
  const convict = require('../')
  let conf

  test('must parse a config specification', function() {

    convict.addFormat({
      name: 'float-percent',
      validate: function(val) {
        if (val !== 0 && (!val || val > 1 || val < 0)) {
          throw new Error('must be a float between 0 and 1, inclusive')
        }
      },
      coerce: function(val) {
        return parseFloat(val, 10)
      }
    })

    convict.addFormats({
      prime: {
        validate: function(val) {
          function isPrime(n) {
            if (n <= 1) {
              return false
            } // zero and one are not prime
            for (let i = 2; i * i <= n; i++) {
              if (n % i === 0) {
                return false
              }
            }
            return true
          }
          if (!isPrime(val)) {
            throw new Error('must be a prime number')
          }
        },
        coerce: function(val) {
          return parseInt(val, 10)
        }
      },
      'hex-string': {
        validate: function(val) {
          if (/^[0-9a-fA-F]+$/.test(val)) {
            throw new Error('must be a hexidecimal string')
          }
        }
      }
    })

    conf = convict({
      foo: {
        enum: {
          format: ['foo', 'bar'],
          default: 'foo'
        },
        port: {
          format: 'port',
          default: 8080
        },
        pipe: {
          format: 'windows_named_pipe',
          default: '\\\\.\\pipe\\test',
        },
        pipe_port: {
          format: 'port_or_windows_named_pipe',
          default: '\\\\.\\pipe\\pipe_port',
        },
        nat: {
          format: 'nat',
          default: 42
        },
        int: {
          format: 'int',
          default: -9
        },
        int2: {
          format: 'integer',
          default: 42
        },
        any: {
          format: '*',
          default: 'foo'
        },
        primeNumber: {
          format: 'prime',
          default: 17
        },
        percentNumber: {
          format: 'float-percent',
          default: 0.5
        },
        optional: {
          format: '*',
          default: undefined
        }
      }
    })

  })

  test('validates default schema', function() {
    expect(function() {
      conf.validate()
    }).not.toThrow()
  })

  test('validates non-coerced correct values', function() {
    conf.set('foo.primeNumber', 7)
    expect(function() {
      conf.validate()
    }).not.toThrow()
  })

  test('validates coerced correct values', function() {
    conf.set('foo.primeNumber', '11')
    expect(function() {
      conf.validate()
    }).not.toThrow()
  })

  test('successfully fails to validate incorrect values', function() {
    conf.set('foo.primeNumber', 16)
    expect(function() {
      conf.validate()
    }).toThrow()
  })

  describe('predefined formats', function() {
    describe('port_or_windows_named_pipe', function() {
      const conf = convict({
        port: {
          format: 'port_or_windows_named_pipe',
          default: '1234',
        },
        pipe: {
          format: 'port_or_windows_named_pipe',
          default: '\\\\.\\pipe\\test',
        },
        to_pipe: {
          format: 'port_or_windows_named_pipe',
          default: 1234,
        },
        to_port: {
          format: 'port_or_windows_named_pipe',
          default: '\\\\.\\pipe\\default',
        },
      })

      test('must coerce ports to integers', function() {
        expect(conf.get('port')).toBe(1234)
      })

      test('must not coerce pipes to integers', function() {
        expect(conf.get('pipe')).toBe('\\\\.\\pipe\\test')
      })

      test('must handle switching from port to pipe', function() {
        conf.set('to_pipe', '\\\\.\\pipe\\changed')
        expect(conf.get('to_pipe')).toBe('\\\\.\\pipe\\changed')
      })

      test('must handle switching from pipe to port', function() {
        conf.set('to_port', '8080')
        expect(conf.get('to_port')).toBe(8080)
      })

      test('must throw for invalid ports', function() {
        const conf = convict({
          invalid: {
            format: 'port_or_windows_named_pipe',
            default: '235235452355',
          },
        })

        expect(function() {
          conf.validate()
        }).toThrow(/must be a windows named pipe or a number within range/)
      })

      test('must throw for invalid pipes', function() {

        const conf = convict({
          invalid: {
            format: 'port_or_windows_named_pipe',
            default: '\\.pipe\\test',
          },
        })

        expect(function() {
          conf.validate()
        }).toThrow(/must be a windows named pipe or a number within range/)
      })
    })
  })

  test('must throw with unknown format', function() {
    expect(function() {
      convict({
        foo: {
          format: 'unknown',
          default: 'bar'
        }
      })
    }).toThrow()
  })

  test('must accept undefined as a default', function() {
    const val = conf.get('foo.optional')
    expect(val).toBeUndefined()
  })

  describe('must return schema in second argument', function() {
    const schema = {
      domains: {
        doc: 'A collection of domain names.',
        format: 'source-array',
        default: [],

        children: {
          domain_base: {
            doc: 'The base domain name',
            format: 'String',
            default: null
          },
          extension: {
            doc: 'The domain name extension',
            format: ['org', 'net', 'com'],
            default: null
          },
          bought: {
            doc: 'Whether the domain has been bought or not',
            format: 'Boolean',
            default: null
          },
        }
      }
    }

    const configWithoutErrors = {
      domains: [
        {
          domain_base: 'mozilla',
          extension: 'org',
          bought: true,
        },
        {
          domain_base: 'gitlab',
          extension: 'com',
          bought: true,
        }
      ]
    }

    const configWithErrors = {
      domains: [
        {
          domain_base: 'mozilla',
          extension: 'org',
          bought: true,
        },
        {
          domain_base: 'gitlab',
          extension: 'com',
          bought: 8,
        }
      ]
    }

    test('must parse a config specification', function() {
      convict.addFormat({
        name: 'source-array',
        validate: function(sources, schema) {
          if (!Array.isArray(sources)) {
            throw new Error('must be of type Array')
          }

          sources.forEach((source) => {
            convict(schema.children).load(source).validate()
          })
        }
      })
    })

    test('must validate children value without throw an Error', function() {
      expect(function() {
        convict(schema).load(configWithoutErrors).validate()
      }).not.toThrow()
    })

    test('successfully fails to validate incorrect children values', function() {
      expect(function() {
        convict(schema).load(configWithErrors).validate()
      }).toThrow(/domains: bought: must be of type Boolean/)
    })
  })

  describe('map like object support - must return schema in second argument', function() {
    const schema = {
      myMap: {
        doc: 'this is a key value map, where the value object can be validated by a child schema',
        default: {},
        format: 'map',
        children: {
          prop: {
            doc: 'a property of the value object',
            default: null,
            format: String
          }
        }
      }
    }

    const configWithoutErrors = {
      myMap: {
        someKey: {prop: 'this belongs to the someKey value object'},
        someOtherKey: {prop: 'this belongs to the someOtherKey value object'}
      }
    }

    const configWithErrors = {
      myMap: {
        someKey: {notDefinedInChildSchema: 'this belongs to the someKey value object'}
      }
    }

    test('must parse a config specification', function() {
      convict.addFormat({
        name: 'map',
        validate: function(theMap, schema) {
          if (typeof theMap !== 'object' || theMap == null) {
            throw new Error('must be an non-empty (map like) object')
          }
          // iterate each key in the map
          for (const key of Object.keys(theMap)) {
            // perform validation on the key's value against the child schema
            convict(schema.children).load(theMap[key]).validate()
          }
        }
      })
    })

    test('must validate children (map) value without throwing an Error', function() {
      expect(function() {
        convict(schema).load(configWithoutErrors).validate()
      }).not.toThrow()
    })

    test('fails to validate incorrect children (map) values', function() {
      expect(function() {
        convict(schema).load(configWithErrors).validate()
      }).toThrow('myMap: prop: must be of type String: value was {"someKey":{"notDefinedInChildSchema":"this belongs to the someKey value object"}}')
    })
  })

})
