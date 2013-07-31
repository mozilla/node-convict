const should = require('should');

describe('convict schema file', function() {
  const convict = require('../');
  var conf;
  var conf2 = convict({
    foo: {
      none: {
        format: String,
        default: undefined
      }
    }
  });

  it('should parse a config specification from a file', function() {
    conf = convict(__dirname + '/schema.json');
  });

  it('should be valid', function() {
    (function() { conf.validate() }).should.not.throw();
  });

  it('should be valid again', function() {
    (function() { conf2.validate() }).should.not.throw();
  });

  describe('.has()', function() {
    it('should not have undefined properties', function() {
      var val = conf.has('foo.bar.madeup');
      should.equal(val, false);
    });

    it('should not have properties specified with a default of undefined', function() {
      var val = conf.has('foo.none');
      should.equal(val, false);
    });
  });

  describe('.get()', function() {
    it('should find a nested value', function() {
      var val = conf.get('foo.bar');
      should.equal(val, 7);
    });

    it('should handle three levels of nesting', function() {
      should.equal(conf.get('foo.baz.bing'), 'foo');
    });

    it('should handle names with spaces and underscores', function() {
      should.equal(conf.get('foo.baz.name with spaces.name_with_underscores'), true);
    });

    it("should throw if conf doesn't exist", function() {
      (function() { conf.get('foo.no') }).should.throw();
    });
  });

  describe('.default()', function() {
    // Temporarily modify a property while testing default()
    before(function() { conf.set('foo.bar', 8); });
    after(function() { conf.set('foo.bar', 7); });

    it('should report the default value of a property', function() {
      should.equal(conf.get('foo.bar'), 8); // Modified
      should.equal(conf.default('foo.bar'), 7);
    });

    it("should throw if key doesn't exist", function() {
      (function() { conf.default('foo.no'); }).should.throw();
    });
  });
});
