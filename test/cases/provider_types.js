'use strict';

exports.conf = {
  boolTrue: {
    default: null,
    format: Boolean,
    providerPath: 'BOOLTRUE'
  },
  boolFalse: {
    default: null,
    format: Boolean,
    providerPath: 'BOOLFALSE'
  },
  int: {
    default: null,
    format: 'int',
    providerPath: 'INT'
  },
  intCoerced: {
    default: null,
    format: 'int',
    providerPath: 'INTCOERCED'
  },
  nat: {
    default: null,
    format: 'nat',
    providerPath: 'NAT'
  },
  natCoerced: {
    default: null,
    format: 'nat',
    providerPath: 'NATCOERCED'
  },
  num: {
    default: null,
    format: Number,
    providerPath: 'NUM'
  },
  array: {
    default: null,
    format: Array,
    providerPath: 'ARRAY'
  },
  object: {
    default: null,
    format: Object,
    providerPath: 'OBJECT'
  },
  regexp: {
    default: null,
    format: RegExp,
    providerPath: 'REGEXP'
  }
};

exports.provider =
function(key){
  let out = {
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
  
  return out[key];
};

