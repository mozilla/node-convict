'use strict';

const chai = require('chai');
const expect = chai.expect;

describe('convict', function() {
  const convict = require('../');
  let conf;

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
    expect(() => conf.validate()).to.not.throw();
  });

  describe('.get()', function() {
    it('must find a nested value', function() {
      let val = conf.get('foo.bar');

      expect(val).to.equal(7);
    });

    it('must handle three levels of nesting', function() {
      expect(conf.get('foo.baz.bing')).to.equal('foo');
    });

    it('must handle names with spaces and underscores', function() {
      expect(conf.get('foo.baz.name with spaces.name_with_underscores')).to.be.true;
    });

    it("must throw if conf doesn't exist", function() {
      expect(() => conf.get('foo.no')).to.throw("cannot find configuration param 'foo.no'");
    });

    it('must get env', function() {
      let val = conf.get('env');

      expect(val).to.equal('bar');
    });
  });
});
