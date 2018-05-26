'use strict';

exports.conf = {
  prefix: {
    default: '/foo',
    format: String,
    env: 'PREFIX'
  },
  suffix: {
    default: '.js',
    format: String,
    arg: 'suffix'
  },
};

exports.env = {
  PREFIX: '',
};

exports.argv = ['node', 'index.js', '--suffix=']
