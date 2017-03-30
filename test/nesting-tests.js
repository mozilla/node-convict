'use strict'

describe('deep nested tree structure', function() {
  const convict = require('../');
  let conf;

  it('must parse a deep nested config specification', function() {
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
    (function() {
      conf.validate({
        allowed: 'strict'
      });
    }).must.not.throw();
  });

  describe('get nested fields value', function() {
    it('must find a value', function() {
      (function() {
        conf.get('db');
      }).must.not.throw();
    });

    it('must handle two levels of nesting', function() {
      conf.get('db.name').must.be('some_db');
    });

    it('must handle three levels of nesting', function() {
      conf.get('db.synchro.active').must.be(true);
    });

    it('must handle three levels of side by side nesting', function() {
      conf.get('db.synchro.remote_url').must.be('http://localhost:3333/');
    });
  });

  describe('alter nested fields value', function() {
    let synchro;

    it('must find a nested value', function() {
      (function() {
        synchro = conf.get('db.synchro');
      }).must.not.throw();
    });

    it('modify a nested value and must be valid', function() {
      synchro.active = false;
      conf.set('db.synchro', synchro);
      (function() {
        conf.validate({
          allowed: 'strict'
        });
      }).must.not.throw();
      conf.get('db.synchro.active').must.be(false);
    });

  });

  describe('alter deep nested fields value', function() {
    let db;

    it('must find a deep nested value', function() {
      (function() {
        db = conf.get('db');
      }).must.not.throw();
    });

    it('modify a deep nested value and must be valid', function() {
      db.synchro.remote_url = 'http://local.test:9876';
      conf.set('db', db);
      (function() {
        conf.validate({
          allowed: 'strict'
        });
      }).must.not.throw();
      conf.get('db.synchro.remote_url').must.be('http://local.test:9876');
    });

  });

  describe('missing chains', function() {
    it('must error when attempting to access a missing chain', function() {
      (function() {
        conf.get('invalid');
      }).must.throw();
      (function() {
        conf.get('invalid.child');
      }).must.throw();
    });

    it('must initialize an empty chain', function() {
      (function() {
        conf.set('invalid.child', 'value');
      }).must.not.throw();
    });

    it('must retrieve an initialized empty chain', function() {
      conf.get('invalid.child').must.be('value');
      conf.get('invalid').must.be.eql({child: 'value'});
    });
  });
})
