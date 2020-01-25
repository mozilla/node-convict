'use strict';

exports.conf = {
  foo: {
    default: 'a',
    format: String,
    env: 'FOO'
  }
};

exports.env = {
  FOO: 'c'
};

exports.data = {
  foo: 'b'
};
