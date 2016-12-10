'use strict';

const expect = require('must');
const moment = require('moment');
const validator = require('validator');

describe('convict formats', function() {
  const convict = require('../');
  let conf;

  it('must parse a config specification', function() {
    convict.addFormats({
      prime: {
        validate: function(val) {
          function isPrime(n) {
            if (n <= 1) return false; // zero and one are not prime
            for (let i=2; i*i <= n; i++) {
              if (n % i === 0) return false;
            }
            return true;
          }
          if (!isPrime(val)) throw new Error('must be a prime number');
        },
        coerce: function(val) {
          return parseInt(val, 10);
        }
      }
    });

    convict.addFormat({
      name: 'float-percent',
      validate: function(val) {
        if (val !== 0 && (!val || val > 1 || val < 0)) {
          throw new Error('must be a float between 0 and 1, inclusive');
        }
      },
      coerce: function(val) {
        return parseFloat(val, 10);
      }
    });

    conf = convict({
      foo: {
        enum: {
          format: ['foo', 'bar'],
          default: 'foo'
        },
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
        },
        host: {
          format: 'ipaddress',
          default: '127.0.0.1'
        },
        port: {
          format: 'port',
          default: 8080
        },
        email: {
          format: 'email',
          default: 'foo@bar.com'
        },
        url: {
          format: 'url',
          default: 'http://example.com'
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
        custom: {
          format: function(val) {
            if (!validator.isAlpha(val)) {
              throw new Error('expected alpha characters, got ' + val);
            }
          },
          default: 'abcd'
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
    });

  });

  it('validates default schema', function() {
    (function() { conf.validate(); }).must.not.throw();
  });

  it('validates non-coerced correct values', function() {
    conf.set('foo.primeNumber', 7);
    (function() { conf.validate(); }).must.not.throw();
  });

  it('validates coerced correct values', function() {
    conf.set('foo.primeNumber', '11');
    (function() { conf.validate(); }).must.not.throw();
  });

  it('successfully fails to validate incorrect values', function() {
    conf.set('foo.primeNumber', 16);
    (function() { conf.validate(); }).must.throw();

    conf.set('foo.duration4', '-7 days');
    (function() { conf.validate(); }).must.throw(Error, /must be a positive integer or human readable string/);

    conf.set('foo.duration5', 'zz-7zzdays');
    (function() { conf.validate(); }).must.throw(Error, /must be a positive integer or human readable string/);
  });

  describe('predefined formats', function() {
    it('must handle timestamp', function() {
      let val = conf.get('foo.date');
      val.must.be(moment('2013-05-05').valueOf());
    });

    it('must handle duration in milliseconds', function() {
      conf.get('foo.duration').must.be(604800000);
    });

    it('must handle duration in a human readable string', function() {
      conf.get('foo.duration2').must.be(60 * 5 * 1000);
    });

    it('must handle duration in milliseconds as a string', function() {
      conf.get('foo.duration3').must.be(12345);
    });
  });

  it('must throw with unknown format', function() {
    (function() {
      convict({
        foo: {
          format: 'unknown',
          default: 'bar'
        }
      });
    }).must.throw();
  });

  it('must accept undefined as a default', function() {
    let val = conf.get('foo.optional');
    expect(val).to.be(undefined);
  });
});
