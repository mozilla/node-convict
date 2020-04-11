'use strict';

module.exports = {
  root: true,
  extends: 'eslint:recommended',
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  rules: {
    strict: ['error', 'global'],

    // JavaScript core
    'no-array-constructor': 'error',
    'no-unused-vars': ['error', {'args': 'none'}],
    'no-unreachable': 'error',
    'no-fallthrough': 'error',
    'default-case': 'error',
    'no-case-declarations': 'error',
    'consistent-return': 'off',

    // Node.js specifics
    'no-process-exit': 'error',
    'no-sync': 'error',
    'no-path-concat': 'error',

    // Presentation
    indent: ['error', 2],
    quotes: ['error', 'single', 'avoid-escape'],
    'new-cap': 'error',
    camelcase: 'off',
    'no-underscore-dangle': 'off',
    'space-before-function-paren': ['warn', 'never'],
  },
};
