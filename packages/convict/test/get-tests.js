'use strict';

const chai = require('chai');
const expect = chai.expect;

const new_require = require('./new_require.js');
const convict = new_require('../');

describe('convict get function', function() {
  let conf;

  it('must parse a schema', function() {
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
          },
          // foo.baz.default
          '$~default': {
            default: 'google',
            format: 'String'
          }
        },
        // foo.default
        '$~default': {
          'sky': {
            format: 'String',
            default: 'cloud'
          },
          // foo.default.default
          '$~default': {
            format: 'String',
            default: 'both'
          }
        }
      },
      'foo.bar': {
        format: 'String',
        default: 'air'
      },
      'foo.baz': {
        bing: {
          format: 'String',
          default: 'bus'
        }
      }
    });
  });

  it('must have the default getters order', function() {
    const order = ['default', 'value', 'env', 'arg', 'force'];
    expect(convict.getGettersOrder()).to.be.deep.equal(order);
  });

  it('must be valid', function() {
    expect(() => conf.validate()).to.not.throw();
  });

  describe('.get()', function() {
    it('must find value with default key (= "$~default")', function() {
      expect(conf.get('foo.baz.default')).to.equal('google');
      expect(conf.get('foo.default.sky')).to.equal('cloud');
      expect(conf.get('foo.default.default')).to.equal('both');
    });

    it('must find a nested value', function() {
      expect(conf.get('foo.bar')).to.equal(7);
      expect(conf.get('["foo.bar"]')).to.equal('air');
    });

    it('must handle three levels of nesting', function() {
      expect(conf.get('foo.baz.bing')).to.equal('foo');
      expect(conf.get('["foo.baz"].bing')).to.equal('bus');
      conf.set('["foo.baz"].bing', 'plane');
      expect(conf.get('["foo.baz"].bing')).to.equal('plane');
    });

    it('must handle names with spaces and underscores', function() {
      expect(conf.get('foo.baz.name with spaces.name_with_underscores')).to.be.true;
    });

    it("must throw if conf doesn't exist", function() {
      expect(() => conf.get('foo.no')).to.throw('foo.no: cannot find "foo.no" property because "foo.no" is not defined.');
    });

    it('must get env', function() {
      let val = conf.get('env');

      expect(val).to.equal('bar');
    });

    it('must parse with custom default substitute', function() {
      conf = convict({
        // default
        '[cvt]default': {
          default: 'myDefaultValue',
          format: 'String'
        }
      }, {
        defaultSubstitute: '[cvt]default'
      });

      const expected = {
        '[cvt]default': {
          'default': 'myDefaultValue',
          'format': 'String'
        }
      };

      const nodeSchemaExpected = {
        '_cvtProperties': {
          'default': {
            'default': 'myDefaultValue',
            'format': 'String'
          }
        }
      };

      conf.validate();

      expect(conf.has('default')).to.be.true;
      expect(conf.getSchemaString()).to.equal(JSON.stringify(expected, null, 2));
      expect(conf.getSchemaString(true)).to.equal(JSON.stringify(nodeSchemaExpected, null, 2));
    });
  });
});
