'use strict';

exports.conf = {
  prefix: {
    default: '/foo',
    format: String,
    env: 'PREFIX'
  },
};

exports.env = {
  PREFIX: '',
};
