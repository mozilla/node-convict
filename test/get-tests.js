require('must');

describe('convict', function() {
  const convict = require('../');
  var conf;

  it('must parse a config specification', function() {
    conf = convict({
      env: {
        format: ['bar', 'baz', 'foo'],
        default: 'bar',
        env: 'NODE_ENV'
      },
      foo: {
        bar: 7,
        baz: {
          bing: 'foo',
          'name with spaces': {
            name_with_underscores: true
          }
        }
      }
    });
  });

  it('must be valid', function() {
    (function() { conf.validate(); }).must.not.throw();
  });

  describe('.get()', function() {
    it('must find a nested value', function() {
      var val = conf.get('foo.bar');
      val.must.be(7);
    });

    it('must handle three levels of nesting', function() {
      conf.get('foo.baz.bing').must.be('foo');
    });

    it('must handle names with spaces and underscores', function() {
      conf.get('foo.baz.name with spaces.name_with_underscores').must.be(true);
    });

    it("must throw if conf doesn't exist", function() {
      (function() { conf.get('foo.no'); }).must.throw();
    });

    it('must get env', function() {
      var val = conf.get('env');
      val.must.be('bar');
    });
  });
});
