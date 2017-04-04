'use strict';

exports.conf = {
  boolTrue: {
    default: null,
    format: Boolean,
    arg: 'booltrue'
  },
  boolShort: {
    default: null,
    format: Boolean,
    arg: 'boolshort'
  },
  boolFalse: {
    default: null,
    format: Boolean,
    arg: 'boolfalse'
  },
  int: {
    default: null,
    format: 'int',
    arg: 'int'
  },
  intCoerced: {
    default: null,
    format: 'int',
    arg: 'intcoerced'
  },
  nat: {
    default: null,
    format: 'nat',
    arg: 'nat'
  },
  natCoerced: {
    default: null,
    format: 'nat',
    arg: 'natcoerced'
  },
  num: {
    default: null,
    format: Number,
    arg: 'num'
  },
  array: {
    default: null,
    format: Array,
    arg: 'array'
  },
  object: {
    default: null,
    format: Object,
    arg: 'object'
  },
  regexp: {
    default: null,
    format: RegExp,
    arg: 'regexp'
  }
};

exports.argv = [
  '--booltrue', 'true',
  '--boolshort',
  '--boolfalse', 'false',
  '--int', '77',
  '--intcoerced', '3.1415',
  '--nat', '666',
  '--natcoerced', '3.1415',
  '--num', '789.1011',
  '--array', 'a,b,c',
  '--object', '{"foo": "bar"}',
  '--regexp', '^foo$'
]
