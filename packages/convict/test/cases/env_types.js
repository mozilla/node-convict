'use strict';

exports.conf = {
  boolTrue: {
    default: null,
    format: Boolean,
    env: 'BOOLTRUE'
  },
  boolFalse: {
    default: null,
    format: Boolean,
    env: 'BOOLFALSE'
  },
  int: {
    default: null,
    format: 'int',
    env: 'INT'
  },
  intCoerced: {
    default: null,
    format: 'int',
    env: 'INTCOERCED'
  },
  nat: {
    default: null,
    format: 'nat',
    env: 'NAT'
  },
  natCoerced: {
    default: null,
    format: 'nat',
    env: 'NATCOERCED'
  },
  num: {
    default: null,
    format: Number,
    env: 'NUM'
  },
  array: {
    default: null,
    format: Array,
    env: 'ARRAY'
  },
  object: {
    default: null,
    format: Object,
    env: 'OBJECT'
  },
  regexp: {
    default: null,
    format: RegExp,
    env: 'REGEXP'
  }
};

exports.env = {
  BOOLTRUE: true,
  BOOLFALSE: false,
  INT: 77,
  INTCOERCED: 3.1415,
  NAT: 666,
  NATCOERCED: 3.1415,
  NUM: 789.1011,
  ARRAY: 'a,b,c',
  OBJECT: '{"foo": "bar"}',
  REGEXP: '^foo$'
};
