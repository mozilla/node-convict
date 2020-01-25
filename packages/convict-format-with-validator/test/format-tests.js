'use strict';

const chai = require('chai');
const expect = chai.expect;

const new_require = require('../../convict/test/new_require.js');
const convict = new_require('../../convict/');

describe('convict formats', function() {
  let conf;

  it('must add formats ("email", "ipaddress" and "url") with convict-format-with-validator', function() {
    convict.addFormats(require('../'));
  });

  it('must parse a config specification', function() {
    conf = convict({
      foo: {
        host: {
          format: 'ipaddress',
          default: '127.0.0.1'
        },
        email: {
          format: 'email',
          default: 'foo@bar.com'
        },
        url: {
          format: 'url',
          default: 'http://example.com'
        }
      }
    });
  });

  it('validates default schema', function() {
    expect(() => conf.validate()).to.not.throw();
  });

  it('successfully fails to validate incorrect values', function() {
    conf.set('foo.email', ';aaaa;');
    expect(() => conf.validate()).to.throw('must be an email address: value was ";aaaa;"');
  });
});
