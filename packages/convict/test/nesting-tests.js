'use strict';

const chai = require('chai');
const expect = chai.expect;

const new_require = require('./new_require.js');
const convict = new_require('../');

const strictMode = {
  allowed: 'strict'
};

describe('deep nested tree structure', function() {
  let conf;

  it('must add formats of convict-format-with-validator', function() {
    convict.addFormats(require('convict-format-with-validator'));
  });

  it('must parse a deep nested schema', function() {
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
          remote_url: {
            format: 'url',
            default: 'http://localhost:8080/'
          }
        }
      }
    });
  });

  it('instance must be valid', function() {
    conf.load({
      db: {
        name: 'some_db',
        synchro: {
          active: true,
          remote_url: 'http://localhost:3333/'
        }
      }
    });

    expect(() => conf.validate(strictMode)).to.not.throw();
  });

  describe('get nested fields value', function() {
    it('must find a value', function() {
      expect(() => conf.get('db')).to.not.throw();
    });

    it('must handle two levels of nesting', function() {
      expect(conf.get('db.name')).to.equal('some_db');
    });

    it('must handle three levels of nesting', function() {
      expect(conf.get('db.synchro.active')).to.be.true;
    });

    it('must handle three levels of side by side nesting', function() {
      expect(conf.get('db.synchro.remote_url')).to.equal('http://localhost:3333/');
    });
  });

  describe('alter nested fields value', function() {
    let synchro;

    it('must find a nested value', function() {
      expect(function() {
        synchro = conf.get('db.synchro');
      }).to.not.throw();
    });

    it('modify a nested value and must be valid', function() {
      synchro.active = false;
      conf.set('db.synchro', synchro);

      expect(() => conf.validate(strictMode)).to.not.throw();
      expect(conf.get('db.synchro.active')).to.be.false;
    });

  });

  describe('alter deep nested fields value', function() {
    let db;

    it('must find a deep nested value', function() {
      expect(() => {
        db = conf.get('db');
      }).to.not.throw();
    });

    it('modify a deep nested value and must be valid', function() {
      db.synchro.remote_url = 'http://local.test:9876';
      conf.set('db', db);

      expect(() => conf.validate(strictMode)).to.not.throw();
      expect(conf.get('db.synchro.remote_url')).to.equal('http://local.test:9876');
    });

  });

  describe('missing chains', function() {
    it('must error when attempting to access a missing chain', function() {
      expect(() => conf.get('invalid')).to.throw('invalid: cannot find "invalid" property because "invalid" is not defined.');
      expect(() => conf.get('invalid.child')).to.throw('invalid.child: cannot find "invalid" property because "invalid" is not defined.');
    });

    it('must initialize an empty chain', function() {
      expect(() => 
        conf.set('invalid.child', 'value')
      ).to.not.throw();
    });

    it('must retrieve an initialized empty chain', function() {
      expect(conf.get('invalid.child')).to.equal('value');
      expect(conf.get('invalid')).to.deep.equal({child: 'value'});
    });
  });
})
