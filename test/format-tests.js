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
        pipe: {
          format: 'windows_named_pipe',
          default: '\\\\.\\pipe\\test',
        },
        pipe_port: {
          format: 'port_or_windows_named_pipe',
          default: '\\\\.\\pipe\\pipe_port',
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

    describe('port_or_windows_named_pipe', function() {

      let conf = convict({
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
      });

      it('must coerce ports to integers', function() {
        conf.get('port').must.be(1234);
      });

      it('must not coerce pipes to integers', function() {
        conf.get('pipe').must.be('\\\\.\\pipe\\test');
      });

      it('must handle switching from port to pipe', function() {
        conf.set('to_pipe', '\\\\.\\pipe\\changed');
        conf.get('to_pipe').must.be('\\\\.\\pipe\\changed');
      });

      it('must handle switching from pipe to port', function() {
        conf.set('to_port', '8080');
        conf.get('to_port').must.be(8080);
      });

      it('must throw for invalid ports', function() {

        let conf = convict({
          invalid: {
            format: 'port_or_windows_named_pipe',
            default: '235235452355',
          },
        });

        (function() { conf.validate() }).must.throw(Error, /must be a windows named pipe or a number within range/);

      });

      it('must throw for invalid pipes', function() {

        let conf = convict({
          invalid: {
            format: 'port_or_windows_named_pipe',
            default: '\\.pipe\\test',
          },
        });

        (function() { conf.validate() }).must.throw(Error, /must be a windows named pipe or a number within range/);

      });

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
