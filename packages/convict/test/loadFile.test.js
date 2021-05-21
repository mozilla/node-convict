'use strict'

const path = require('path')
const json5 = require('json5')
const yaml = require('js-yaml')
const toml = require('toml')

const convict = require('../')
const schema = require('./cases/formats/schema')
const expected_output = require('./cases/formats/out')

describe('convict', function() {

  describe('.addParser()', function() {
    test('must not throw on valid parser', function() {
      expect(function() {
        convict.addParser({extension: 'json', parse: JSON.parse})
      }).not.toThrow()
      expect(function() {
        convict.addParser({extension: ['yml', 'yaml'], parse: yaml.load})
      }).not.toThrow()
    })

    test('must not throw on valid array of parsers', function() {
      expect(function() {
        convict.addParser([
          {extension: 'json', parse: JSON.parse},
          {extension: ['yml', 'yaml'], parse: yaml.load}
        ])
      }).not.toThrow()
    })

    test('must throw on invalid parser', function() {
      expect(function() {
        convict.addParser(undefined)
      }).toThrow()
      expect(function() {
        convict.addParser(null)
      }).toThrow()
    })

    test('must throw on invalid parser that is missing extension', function() {
      expect(function() {
        convict.addParser({parse: JSON.parse})
      }).toThrow()
    })

    test('must throw on invalid parser that has invalid extension', function() {
      expect(function() {
        convict.addParser({extension: 100, parse: JSON.parse})
      }).toThrow()
      expect(function() {
        convict.addParser({extension: ['yml', 100], parse: yaml.parse})
      }).toThrow()
    })

    test('must throw on invalid parser that is missing parse function', function() {
      expect(function() {
        convict.addParser({extension: 'json'})
      }).toThrow()
    })

    test('must throw on invalid parser that has invalid parse function', function() {
      expect(function() {
        convict.addParser({extension: 'json', parse: 100})
      }).toThrow()
    })

    test('must throw on invalid array of parsers', function() {
      expect(function() {
        convict.addParser([
          undefined,
          null,
          {extension: 'json'}, // Missing parse function
          {extension: 'json', parse: 100}, // Invalid parse function
          {parse: JSON.parse}, // Missing extension
          {extension: 100, parse: JSON.parse}, // Invalid extension
          {extension: ['yaml', 200], parse: yaml.parse}, // Invalid extension array
        ])
      }).toThrow()
    })
  })

  describe('convict().loadFile()', function() {
    test('must work using default json parser if format isn\'t supported', function() {
      const conf = convict(schema)
      conf.loadFile(path.join(__dirname, 'cases/formats/data'))

      expect(function() {
        conf.validate()
      }).not.toThrow()
      expect(conf.get()).toEqual(expected_output)
    })

    test('must work with custom json parser', function() {
      convict.addParser({extension: 'json', parse: JSON.parse})

      const conf = convict(schema)
      conf.loadFile(path.join(__dirname, 'cases/formats/data.json'))

      expect(function() {
        conf.validate()
      }).not.toThrow()
      expect(conf.get()).toEqual(expected_output)
    })

    test('must work with custom json5 parser', function() {
      convict.addParser({extension: 'json5', parse: json5.parse})

      const conf = convict(schema)
      conf.loadFile(path.join(__dirname, 'cases/formats/data.json5'))

      expect(function() {
        conf.validate()
      }).not.toThrow()
      expect(conf.get()).toEqual(expected_output)
    })

    test('must work with custom yaml parser', function() {
      convict.addParser({extension: ['yml', 'yaml'], parse: yaml.load})

      const conf = convict(schema)
      conf.loadFile(path.join(__dirname, 'cases/formats/data.yaml'))

      expect(function() {
        conf.validate()
      }).not.toThrow()
      expect(conf.get()).toEqual(expected_output)
    })

    test('must work with custom toml parser', function() {
      convict.addParser({extension: 'toml', parse: toml.parse})

      const conf = convict(schema)
      conf.loadFile(path.join(__dirname, 'cases/formats/data.toml'))

      expect(function() {
        conf.validate()
      }).not.toThrow()
      expect(conf.get()).toEqual(expected_output)
    })

    test('must use wildcard parser if no parser is registered for extension', function() {
      const message = 'Unsupported file type'
      convict.addParser({extension: '*', parse: function() {
        throw new Error(message)
      }})

      const conf = convict(schema)
      expect(function() {
        conf.loadFile(path.join(__dirname, 'cases/formats/data.xml'))
      }).toThrow(message)
    })

    test('must not break when parsing an empty file', function() {
      convict.addParser({extension: ['yml', 'yaml'], parse: yaml.load})

      const conf = convict(schema)
      conf.loadFile(path.join(__dirname, 'cases/formats/data.empty.yaml'))

      expect(function() {
        conf.validate()
      }).not.toThrow()
    })
  })

})
