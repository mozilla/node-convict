const should = require('should');

describe('convict', function() {
  const convict = require('../');
  var conf;

  it('should parse a config specification', function() {
    conf = convict({
      foo: {
        bar: "number = 7",
        baz: {
          bing: 'string = "foo"',
          "name with spaces": {
            name_with_underscores: "boolean = true"
          }
        }
      }
    });
  });

  it('should be valid', function() {
    (function() { conf.validate() }).should.not.throw();
  });

  describe('.get()', function() {
    it('should find a nested value', function() {
      (conf.get('foo.bar')).should.equal(7);
    });

    it('should handle three levels of nesting', function() {
      (conf.get('foo.baz.bing')).should.equal('foo');
    });

    it('should handle names with spaces and underscores', function() {
      (conf.get('foo.baz.name with spaces.name_with_underscores')).should.equal(true);
    });

    it("should throw if conf doesn't exist", function() {
      (function() { conf.get('foo.no') }).should.throw();
    });
  });
});
