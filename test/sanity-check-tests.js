const should = require('should');

describe('convict', function() {
  const convict = require('../');
  var conf;

  it('should parse a config specification', function() {
    conf = convict({
      foo: {
        bar: {
          default: "foo",
          sanityCheck: function(val, cb) {
            process.nextTick(function() { cb("something failed!"); });
          }
        },
        baz: {
          default: "goo",
          sanityCheck: function(val, cb) {
            process.nextTick(function() { cb("something else failed!"); });
          }
        }
      }
    });
  });

  it('should be valid', function() {
    (function() { conf.validate() }).should.not.throw();
  });

  it('should perform an individual sanity check', function(done) {
    conf.sanityCheck("foo.bar", function (err) {
      (err).should.equal('something failed!');
      done();
    });
  });

  it('should perform sanity checks', function(done) {
    var expected = 2;
    conf.sanityCheck(function (err) {
      (err).should.not.equal(null);
      if (! --expected) done();
    });
  });

});
