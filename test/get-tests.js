const should = require('should');

describe('convict', function() {
  const convict = require('../');
  var conf;

  it('should parse a config specification', function() {
    conf = convict({
      env: {
        format: ['bar', 'baz', 'foo'],
        default: 'bar',
        env: 'NODE_ENV'
      },
      foo: {
        bar: 7,
        baz: {
          bing: "foo",
          "name with spaces": {
            name_with_underscores: true
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

    it('should get env', function() {
      var val = conf.get('env');
      should.equal(val, 'bar');
    });
  });
});
