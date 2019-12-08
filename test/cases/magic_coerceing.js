'use strict';

exports.conf = {
  int: {
    default: 8,
    env: 'INT'
  },
  str: {
    format: 'String',
    default: '8',
    env: ''
  }
};

exports.env = {
  INT: '7'
};
