'use strict';

function new_require(packageName) {
  const path = require.resolve(packageName);
  const before = require.cache[path] || false;

  if (before) {
    delete require.cache[path];
  }

  const newModule = require(packageName);

  delete require.cache[path];

  if (before) {
    require.cache[path] = before;
  }

  return newModule;
}

module.exports = new_require;
