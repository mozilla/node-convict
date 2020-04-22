'use strict';

module.exports = {
  root: true,
  extends: 'eslint:recommended',
  env: {
    es6: true,
    node: true,
  },
  rules: {
    //*** Programming best practices ***

    strict: ['error', 'safe'],
    semi: ['error', 'never'],

    'no-unused-vars': ['error', {args: 'none'}],

    // Don't use "var", only use "let" and "const"
    'no-var': 'error',
    // Use const if a variable is never reassigned
    'prefer-const': 'error',

    // No redeclaration of existing restricted names and builtins
    'no-shadow-restricted-names': 'error',
    // No redeclaration of existing variables in outer scope
    //'no-shadow': ['error', {builtinGlobals: true}],
    //
    // Interesting but produces less readable code …
    //'no-shadow': ['error', {builtinGlobals: true, hoist: 'all'}],

    'no-array-constructor': ['error'],

    // No dead code
    'no-unreachable': 'error',

    // Take full advantage of JavaScript flexibility by being able, in a
    // function, to return different types (for exemple sometimes a boolean
    // and sometimes an object).
    'consistent-return': 'off',

    // Disallow gratuitous parentheses
    'no-extra-parens': ['error', 'all', {conditionalAssign: false}],

    // Error best practices:
    // Only throw Error instances
    'no-throw-literal': 'error',

    // Switch-case best practices
    'default-case': 'error',
    'no-fallthrough': 'error',
    'no-case-declarations': 'error',

    // Enforces return statements in callbacks of array's methods
    'array-callback-return': 'error',

    'no-console': 'error',

    //*** Presentation style ***

    indent: ['error', 2],
    quotes: ['error', 'single', {avoidEscape: true}],
    'quote-props': ['error', 'as-needed'],

    // Use as much as possible snake_case for variable names and camelCase for
    // function names.
    camelcase: 'off',

    'new-cap': 'error',

    'no-multiple-empty-lines': ['error', {max: 2}],
    'no-trailing-spaces': 'error',
    'comma-spacing': ['error', {before: false, after: true}],
    'space-in-parens': ['error', 'never'],
    'keyword-spacing': 'error',
    'space-before-blocks': 'error',
    'space-infix-ops': 'error',
    'space-before-function-paren': ['error', 'never'],
    'no-spaced-func': 'error',
    'no-multi-spaces': 'error',
    'space-unary-ops': 'error',
    'object-curly-spacing': ['error', 'never'],
    'array-bracket-spacing': ['error', 'never'],
    'brace-style': ['error', '1tbs'],
    curly: ['error', 'all'],

    //*** Node.js specifics ***

    'no-process-exit': 'error',

    // Use "require" statements in the global scope context (eg. no
    // "require" statements inside functions, etc.)
    //'global-require': 'error',

    // Use Buffer.from, Buffer.alloc, and Buffer.allocUnsafe instead of the
    // Buffer constructor (security vulnerabilities).
    'no-buffer-constructor': 'error',

    // No Sync methods are they degrade perfs
    'no-sync': 'error',

    // Disallow string concatenation when using __dirname and __filename
    'no-path-concat': 'error',

    // Enforce Callback Error Handling
    'handle-callback-err': 'error',

    'no-new-require': 'error',
  },
};
