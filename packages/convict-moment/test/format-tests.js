'use strict';

require('must');

const moment = require('moment');

describe('convict formats', function() {
  const convict = require('convict');
  let conf;

  it('must add "duration" and "timestamp" format with convict-moment', function() {
    convict.addFormat(require('../').duration);
    convict.addFormat(require('../').timestamp);
  });

  it('must parse a config specification', function() {
    conf = convict({
      foo: {
        date: {
          format: 'timestamp',
          default: '2013-05-05'
        },
        duration: {
          format: 'duration',
          default: 604800000
        },
        duration2: {
          format: 'duration',
          default: '5 minutes'
        },
        duration3: {
          format: 'duration',
          default: '12345'
        },
        duration4: {
          format: 'duration',
          default: '12345'
        },
        duration5: {
          format: 'duration',
          default: '12345'
        }
      }
    });

  });

  it('validates default schema', function() {
    (function() { conf.validate(); }).must.not.throw();
  });

  it('successfully fails to validate incorrect values', function() {
    conf.set('foo.duration4', '-7 days');
    (function() { conf.validate(); }).must.throw(Error, /must be a positive integer or human readable string/);

    conf.set('foo.duration5', 'zz-7zzdays');
    (function() { conf.validate(); }).must.throw(Error, /must be a positive integer or human readable string/);
  });

  describe('predefined formats', function() {
    it('must handle timestamp', function() {
      let val = conf.get('foo.date');
      val.must.be(moment('2013-05-05').valueOf());
    });

    it('must handle duration in milliseconds', function() {
      conf.get('foo.duration').must.be(604800000);
    });

    it('must handle duration in a human readable string', function() {
      conf.get('foo.duration2').must.be(60 * 5 * 1000);
    });

    it('must handle duration in milliseconds as a string', function() {
      conf.get('foo.duration3').must.be(12345);
    });
  });
});
