'use strict';

exports.conf = {
  foo: {
    default: 'a',
    format: String,
    env: 'FOO'
  },
  bar: {
    default: 'a',
    format: String,
    env: 'FOO'
  },
};
exports.env = {
  FOO: 'b'
};
