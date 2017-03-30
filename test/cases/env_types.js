'use strict';

exports.conf = {
  boolTrue: {
    default: true,
    format: Boolean,
    env: 'BOOLTRUE'
  },
  boolFalse: {
    default: false,
    format: Boolean,
    env: 'BOOLFALSE'
  },
  int: {
    default: 42,
    format: 'int',
    env: 'INT'
  },
  nat: {
    default: 333,
    format: 'nat',
    env: 'NAT'
  },
  num: {
    default: 10.1,
    format: Number,
    env: 'NUM'
  },
  array: {
    default: ['a', 'b'],
    format: Array,
    env: 'ARRAY'
  },
  object: {
    format: Object,
    default: {},
    env: 'OBJECT'
  },
  regexp: {
    format: RegExp,
    default: /.*/,
    env: 'REGEXP'
  }
};

exports.env = {
  BOOLTRUE: true,
  BOOLFALSE: false,
  INT: 77,
  NAT: 666,
  NUM: 789.1011,
  ARRAY: 'a,b,c',
  OBJECT: '{"foo": "bar"}',
  REGEXP: '^foo$'
};
