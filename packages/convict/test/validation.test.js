'use strict'

const path = require('path')

const convict = require('../')

describe('configuration files contain properties not declared in the schema', function() {
  const config = convict({
    foo: {
      doc: 'testing',
      format: String,
      default: 'testing'
    },
    bar: {
      doc: 'testing',
      format: String,
      default: 'testing'
    },
    nested: {
      level1: {
        doc: 'testing',
        format: String,
        default: 'testing'
      },
      level2:{
        level3:{
          doc:'testing',
          format:String,
          default:'testing'
        }
      }
    }
  })

  test('must not throw, if properties in config file match with the schema', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_correct.json'))
    expect(function() {
      config.validate({
        allowed: 'strict'
      })
    }).not.toThrow()
  })

  test('must not throw, if the option to check for non schema properties is set by default but must display warnings', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'))
    expect(function() {
      config.validate()
    }).not.toThrow()
  })

  test('must not throw, if the option to check for non schema properties is not specified and must display warnings', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'))
    expect(function() {
      config.validate()
    }).not.toThrow()
  })

  test('must throw, if properties in config file do not match the properties declared in the schema', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'))
    expect(function() {
      config.validate({
        allowed: 'strict'
      })
    }).toThrow(/not declared/)
  })

  test('must display warning, if properties in config file do not match the properties declared in the schema', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'))
    expect(function() {
      config.validate({
        allowed: 'warn'
      })
    }).not.toThrow()
  })

  test('must throw, if properties in instance do not match the properties declared in the schema and there are incorrect values', function() {
    expect(function() {
      config.load({
        foo: 58,
        bar: 98,
        nested: {
          level1_1: 'undeclared'
        },
        undeclared: 'this property is not declared in the schema'
      })
      config.validate({
        allowed: 'strict'
      })
    }).toThrow()
  })
  let message = ''
  function myOutput(str) {
    message += str
  }

  test('must not break when a failed validation follows an undeclared property and must display warnings, and call the user output function', function() {
    expect(function() {
      convict.addFormat('foo', function(val) {
        if (val !== 0) {
          throw new Error('Validation error')
        }
      })

      const config = convict({
        test2: {
          one: {default: 0},
          two: {
            format: 'foo',
            default: 0
          }
        }
      })

      // if this key is a number, the error occurs; if it is a string, it does not
      // i don't know why. the deep nesting is also required.
      config.load({0: true})
      config.load({test2: {two: 'two'}})
      config.validate({
        output: myOutput
      })
    }).toThrow(/Validation error/)
  })

  test('must use the user output function when it was declared', function() {
    expect(message).toMatch(/Warning:.* configuration param '0' not declared in the schema/)
  })

  test('must only accept function when user set an output function', function() {
    config.loadFile(path.join(__dirname, 'cases/validation_incorrect.json'))
    expect(function() {
      config.validate({
        output: 312
      })
    }).toThrow(/options\.output is optional and must be a function\./)
  })

  test('must not break on consecutive overrides', function() {
    expect(function() {
      const config = convict({
        object: {
          doc: 'testing',
          format: Object,
          default: {}
        }
      })
      config.loadFile([
        path.join(__dirname, 'cases/object_override1.json'),
        path.join(__dirname, 'cases/object_override2.json')
      ])
      config.validate()
    }).not.toThrow()
  })
})

describe('setting specific values', function() {

  test('must not show warning for undeclared nested object values', function() {
    expect(function() {
      const config = convict({
        object: {
          doc: 'testing',
          format: Object,
          default: {}
        }
      })
      config.set('object', {foo: 'bar'})
      config.validate({allowed: 'strict'})
    }).not.toThrow()
  })

  test('must show warning for undeclared property names similar to nested declared property name', function() {
    expect(function() {
      const config = convict({
        parent: {
          object: {
            doc: 'testing',
            format: Object,
            default: {}
          }
        },
      })
      config.set('parent.object', {foo: 'bar'})
      config.set('parent_object', {foo: 'bar'})
      config.validate({allowed: 'strict'})
    }).toThrow()
  })

  test('must show warning for undeclared property names starting with declared object properties', function() {
    expect(function() {
      const config = convict({
        object: {
          doc: 'testing',
          format: Object,
          default: {}
        }
      })
      config.set('object', {foo: 'bar'})
      config.set('objectfoo', {foo: 'bar'})
      config.validate({allowed: 'strict'})
    }).toThrow()
  })
})

describe('schema contains an object property with a custom format', function() {

  test('must throw if a nested object property has an undeclared format', function() {
    expect(function() {
      const config = convict({
        object: {
          doc: 'testing',
          format: 'undefinedFormat',
          default: {
            bar: 'baz',
          },
        },
      })

      config.validate({allowed: 'strict'})
    }).toThrow()
  })

  test('must not throw if an object property has a nested value and a custom format', function() {
    expect(function() {
      convict.addFormat('foo', function() {})
      const config = convict({
        object: {
          doc: 'testing',
          format: 'foo',
          default: {
            bar: 'baz',
          },
        },
      })

      config.validate({allowed: 'strict'})
    }).not.toThrow()
  })

  test('must not throw if a declared object property with a custom format and with nested values is set', function() {
    expect(function() {
      convict.addFormat('foo', function() {})
      const config = convict({
        object: {
          doc: 'testing',
          format: 'foo',
          default: {
            bar: 'baz',
          },
        },
      })

      config.set('object', {bar: '', baz: 'blah'})
      config.validate({allowed: 'strict'})
    }).not.toThrow()
  })

  it.skip("must not throw if an object's default value property name contains a period", function() {
    expect(function() {
      const config = convict({
        object: {
          doc: 'default value contains property name that contains a period',
          format: Object,
          default: {
            'foo.bar': ''
          }
        }
      })

      config.validate()
    }).not.toThrow()
  })

})
