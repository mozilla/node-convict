'use strict';

exports.conf = {
  shorthand: 'value',
  basic: {
    default: true
  },
  doc: {
    default: null,
    doc: 'A value with a docstring'
  },
  format: {
    default: 1,
    format: 'nat'
  },
  typeFormat: {
    default: true,
    format: Boolean
  },
  env: {
    default: '',
    env: 'ENV'
  },
  arg: {
    default: false,
    arg: 'arg'
  },
  sensitive: {
    default: 'password',
    sensitive: true
  },
  combined: {
    default: 'hello',
    doc: 'A value with every property set',
    format: String,
    env: 'COMBINED',
    arg: 'combined',
    sensitive: false
  },
  nested: {
    child: 'ababa'
  }
};
