'use strict';

exports.conf = {
  foo: {
    default: 'a',
    format: String,
    env: 'FOO',
  },
  port: {
    default: 0,
    format: 'port',
    env: 'PORT',
    doc: 'The port to bind.'
  },
  max_count: {
    default: 800,
    format: 'Number',
    env: 'MAX_COUNT',
    doc: 'Maximum number of elements allowed.'
  }
};
