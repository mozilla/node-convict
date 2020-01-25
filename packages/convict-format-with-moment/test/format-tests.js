'use strict';

const chai = require('chai');
const expect = chai.expect;

const moment = require('moment');

const new_require = require('../../convict/test/new_require.js');
const convict = new_require('../../convict/');

describe('convict formats', function() {
  let conf;

  it('must add "duration" and "timestamp" format with convict-format-with-moment', function() {
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
    expect(() => conf.validate()).to.not.throw();
  });

  it('successfully fails to validate incorrect values', function() {
    conf.set('foo.duration4', '-7 days');
    expect(() => conf.validate()).to.throw('must be a positive integer or human readable string');

    conf.set('foo.duration5', 'zz-7zzdays');
    expect(() => conf.validate()).to.throw('must be a positive integer or human readable string');
  });

  describe('predefined formats', function() {
    it('must handle timestamp', function() {
      expect(conf.get('foo.date')).to.equal(moment('2013-05-05').valueOf());
    });

    it('must handle duration in milliseconds', function() {
      expect(conf.get('foo.duration')).to.equal(604800000);
      expect(conf.getOrigin('foo.duration')).to.equal('default');
    });

    it('must handle duration in a human readable string', function() {
      expect(conf.get('foo.duration2')).to.equal(60 * 5 * 1000);
    });

    it('must handle duration in milliseconds as a string', function() {
      expect(conf.get('foo.duration3')).to.equal(12345);
    });
  });
});
