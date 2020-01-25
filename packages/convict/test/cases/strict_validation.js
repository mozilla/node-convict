'use strict';

exports.conf = {
  foo: {
    default: 'a',
    format: String
  }
};

exports.data = {
  bar: false
}

exports.validate = {
  allowed: 'strict'
};
