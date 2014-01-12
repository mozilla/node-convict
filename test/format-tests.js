const should = require('should');
const check = require('validator').check;

describe('convict formats', function() {
  const convict = require('../');
  var conf;

  it('should parse a config specification', function() {
    convict.addFormats({
      prime: {
        validate: function(val) {
          function isPrime(n) {
            if (n <= 1) return false; // zero and one are not prime
            for (var i=2; i*i <= n; i++) {
              if (n % i == 0) return false;
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

    conf = convict({
      foo: {
        enum: {
          format: ['foo', 'bar'],
          default: 'foo'
        },
        date: {
          format: 'timestamp',
          default: 'May 5, 2013'
        },
        duration: {
          format: 'duration',
          default: '5 minutes'
        },
        host: {
          format: 'ipaddress',
          default: '127.0.0.1'
        },
        host2: {
          format: 'ipv4',
          default: '127.0.0.1'
        },
        host3: {
          format: 'ipv6',
          default: '::1'
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
          default: "foo"
        },
        custom: {
          format: function (val) {
            check(val, 'expected alpha characters, got ' + val).isAlpha();
          },
          default: 'abcd'
        },
        primeNumber: {
          format: 'prime',
          default: 17
        },
        optional: {
          format: '*',
          default: undefined
        }
      }
    });

  });

  it('should be valid', function() {
    (function() { conf.validate() }).should.not.throw();
  });

  it('should be invalid', function() {
    conf.set('foo.primeNumber', 16);
    (function() { conf.validate() }).should.throw();
  });

  describe('predefined formats', function() {
    it('should handle timestamp', function() {
      var val = conf.get('foo.date');
      should.equal(val, new Date('May 5, 2013').getTime());
    });

    it('should handle duration', function() {
      should.equal(conf.get('foo.duration'), 60 * 5 * 1000);
    });
  });

  it('should throw with unknown format', function() {
    (function() {
      var conf2 = convict({
        foo: {
          format: 'unknown',
          default: 'bar'
        }
      });
    }).should.throw();
  });

  it('should accept undefined as a default', function() {
    var val = conf.get('foo.optional');
    should.equal(val, undefined);
  });
});
