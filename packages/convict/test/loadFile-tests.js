'use strict';

const chai = require('chai');
const expect = chai.expect;

const path = require('path');
const json5 = require('json5');
const yaml = require('js-yaml');
const toml = require('toml');

const new_require = require('./new_require.js');
const convict = new_require('../');

describe('convict loadFile & addParser functions', function() {
  const schema = require('./fixtures/formats/schema');
  const expected_output = require('./fixtures/formats/out');

  describe('.addParser()', function() {
    it('must not throw on valid parser', function() {
      const parser1 = {
        extension: 'json',
        parse: JSON.parse
      };
      const parser2 = {
        extension: ['yml', 'yaml'],
        parse: yaml.safeLoad
      };

      expect(() => convict.addParser(parser1)).to.not.throw();
      expect(() => convict.addParser(parser2)).to.not.throw();
    });

    it('must not throw on valid array of parsers', function() {
      const parsers = [
        { extension: 'json', parse: JSON.parse },
        { extension: ['yml', 'yaml'], parse: yaml.safeLoad }
      ];

      expect(() => convict.addParser(parsers)).to.not.throw();
    });

    it('must throw on invalid parser', function() {
      expect(() => convict.addParser(undefined)).to.throw('Invalid parser');
      expect(() => convict.addParser(null)).to.throw('Invalid parser');

      const parsers = [
        undefined, // Invalid parser
        { extension: 'json' }, // Missing parse function
        { extension: 'json', parse: 100 } // Invalid parse function
      ];
      // Must throw on the first key
      expect(() => convict.addParser(parsers)).to.throw('Invalid parser');
    });

    it('must throw on invalid parser that is missing extension', function() {
      const parser = {
        parse: JSON.parse
      };
      expect(() => convict.addParser(parser)).to.throw('Missing parser.extension');
    });

    it('must throw on invalid parser that has invalid extension', function() {
      const parser1 = {
        extension: 100,
        parse: JSON.parse
      };
      const parser2 = {
        extension: ['yml', 100],
        parse: yaml.parse
      };

      expect(() => convict.addParser(parser1)).to.throw('Invalid parser.extension');
      expect(() => convict.addParser(parser2)).to.throw('Invalid parser.extension');
    });

    it('must throw on invalid parser that is missing parse function', function() {
      const parser = {
        extension: 'json'
      };
      expect(() => convict.addParser(parser)).to.throw('Missing parser.parse function');
    });

    it('must throw on invalid parser that has invalid parse function', function() {
      const parser = {
        extension: 'json',
        parse: 100
      };
      expect(() => convict.addParser(parser)).to.throw('Invalid parser.parse function');
    });
  });

  describe('convict().loadFile()', function() {
    it('must work using default json parser if format isn\'t supported', function() {
      const conf = convict(schema);
      conf.loadFile(path.join(__dirname, 'fixtures/formats/data'));

      expect(() => conf.validate()).to.not.throw();
      expect(conf.get()).to.deep.equal(expected_output);
    });

    it('must work with custom json parser', function() {
      convict.addParser({ extension: 'json', parse: JSON.parse });

      const conf = convict(schema);
      conf.loadFile(path.join(__dirname, 'fixtures/formats/data.json'));

      expect(() => conf.validate()).to.not.throw();
      expect(conf.get()).to.deep.equal(expected_output);
    });

    it('must work with custom json5 parser', function() {
      convict.addParser({ extension: 'json5', parse: json5.parse });

      const conf = convict(schema);
      conf.loadFile(path.join(__dirname, 'fixtures/formats/data.json5'));

      expect(() => conf.validate()).to.not.throw();
      expect(conf.get()).to.deep.equal(expected_output);
    });

    it('must work with custom yaml parser', function() {
      convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.safeLoad });

      const conf = convict(schema);
      conf.loadFile(path.join(__dirname, 'fixtures/formats/data.yaml'));

      expect(() => conf.validate()).to.not.throw();
      expect(conf.get()).to.deep.equal(expected_output);
    });

    it('must work with custom toml parser', function() {
      convict.addParser({ extension: 'toml', parse: toml.parse });

      const conf = convict(schema);
      conf.loadFile(path.join(__dirname, 'fixtures/formats/data.toml'));

      expect(() => conf.validate()).to.not.throw();
      expect(conf.get()).to.deep.equal(expected_output);
    });

    it('must use wildcard parser if no parser is registered for extension', function() {
      const filepath = path.join(__dirname, 'fixtures/formats/data.xml');
      const message = 'Unsupported file type'
      convict.addParser({ extension: '*', parse: function() { throw new Error(message) } });
      const conf = convict(schema);

      expect(() => conf.loadFile(filepath)).to.throw(message);
    });
	
    it('must not break when parsing an empty file', function() {
      convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.safeLoad });
    
      const conf = convict(schema);
      conf.loadFile(path.join(__dirname, 'fixtures/formats/data.empty.yaml'));
    
      expect(() => conf.validate()).to.not.throw();
    });
  });
});
