'use strict';

const chai = require('chai');
const expect = chai.expect;

const new_require = require('./new_require.js');
const convict = new_require('../');

describe('convict set function', function() {
  const conf = convict({
    color: {
      format: 'String',
      default: 'green',
      env: 'COLOR'
    }
  }, {
    env: {
      'COLOR': 'blue'
    }
  });

  it('must have the default getters order', function() {
    const order = ['default', 'value', 'env', 'arg', 'force'];
    expect(convict.getGettersOrder()).to.be.deep.equal(order);
  });

  const result = (value, getter) => ({ value, getter });
  const get = (path) => result(conf.get(path), conf.getOrigin(path));

  it('must get the expected getter values', function() {
    expect(get('color')).to.deep.equal(result('blue', 'env'));
    expect(conf.default('color')).to.equal('green')
  });

  it('must reset to default value and set getOrigin to default', function() {
    conf.reset('color')
    expect(get('color')).to.deep.equal(result('green', 'default'));
  });

  it('must set getter values and return this value', function() {
    conf.set('color', 'blue', 'env');
    expect(get('color')).to.deep.equal(result('blue', 'env'));
    expect(conf.default('color')).to.equal('green')
  });

  it('must respect the priority of value (inferior to `env` getter) and do not change property value', function() {
    conf.set('color', 'orange', false, true);
    expect(get('color')).to.deep.equal(result('blue', 'env'));
  });

  it('must respect priority because force is the highest level', function() {
    conf.set('color', 'green', true, true);
    ['default', 'value', 'env', 'arg'].forEach((priority) => {
      conf.set('color', 'orange', priority, true);
      expect(get('color')).to.deep.equal(result('green', 'force'));
    });
    expect(get('color')).to.deep.equal(result('green', 'force'));
    conf.set('color', 'blue');
  });

  it('must not change forced value with load', function() {
    conf.set('color', 'green', true, true);
    conf.load({color: 'blue'});
    expect(get('color')).to.deep.equal(result('green', 'force'));
  });

  it('must change value if we do not care of priority', function() {
    conf.set('color', 'chartreuse', 'default'); // respectPriority = false
    expect(get('color')).to.deep.equal(result('chartreuse', 'default'));
  });

  it('must change value with load if we use higher getter level', function() {
    conf.load({color: 'green'});
    expect(get('color')).to.deep.equal(result('green', 'value'));
  });

  it('must change the value with refreshGetters because value was not forced', function() {
    expect(get('color')).to.deep.equal(result('green', 'value'));
    conf.refreshGetters();
    expect(get('color')).to.deep.equal(result('blue', 'env'));
  });

  it('must not change the value with refreshGetters because value was forced', function() {
    conf.set('color', 'green', true, true);
    expect(get('color')).to.deep.equal(result('green', 'force'));
    conf.refreshGetters();
    expect(get('color')).to.deep.equal(result('green', 'force'));
  });

  it('must throw with not declared property', function() {
    expect(() => conf.set('ghosty', 'pink', 'arg')).to.throw('you cannot set priority because "ghosty" not declared in the schema');
  });

  it('must be valid', function() {
    expect(() => conf.validate()).to.not.throw();
  });

  it('must throw with unknown getter (= incorrect usage)', function() {
    expect(() => conf.set('color', 'pink', 'nobody')).to.throw('unknown getter: nobody');
  });

  it('must throw with not declared property (= incorrect usage)', function() {
    expect(() => conf.set('ghosty', 'pink', 'arg')).to.throw('you cannot set priority because "ghosty" not declared in the schema');
  });
});
