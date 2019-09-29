/**
 * convict-moment
 * Format 'duration' and 'timestamp' for convict
 */
'use strict'

const moment = require('moment')

function assert(assertion, err_msg) {
  if (!assertion) {
    throw new Error(err_msg)
  }
}

const duration = {
  name: 'duration',
  coerce: (v) => {
    let split = v.split(' ')
    if (split.length == 1) {
      // It must be an integer in string form.
      v = parseInt(v, 10)
    } else {
      // Add an "s" as the unit of measurement used in Moment
      if (!split[1].match(/s$/)) split[1] += 's'
      v = moment.duration(parseInt(split[0], 10), split[1]).valueOf()
    }
    return v
  },
  validate: function(x) {
    let err_msg = 'must be a positive integer or human readable string (e.g. 3000, "5 days")'
    if (Number.isInteger(x)) {
      assert(x >= 0, err_msg)
    } else {
      assert(x.match(/^(\d)+ (.+)$/), err_msg)
    }
  }
}

const timestamp = {
  name: 'timestamp',
  coerce: (v) => moment(v).valueOf(),
  validate: function(x) {
    assert(Number.isInteger(x) && x >= 0, 'must be a positive integer')
  }
}

module.exports = {
  duration: duration,
  timestamp: timestamp
}
