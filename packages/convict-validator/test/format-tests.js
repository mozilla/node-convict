'use strict';

require('must');

describe('convict formats', function() {
  const convict = require('convict');
  let conf;

  it('must add formats ("email", "ipaddress" and "url") with convict-validator', function() {
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
    (function() { conf.validate(); }).must.not.throw();
  });
});
