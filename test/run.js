#!/usr/bin/env node

const
fs = require('fs'),
path = require('path');

var files = fs.readdirSync(path.join(__dirname, 'cases'));

var tests = {};
files.forEach(function(f) {
  var m = /^([a-zA-Z_\-0-9]+)\.conf$/.exec(f);
  if (m) tests[m[1]] = {
    spec: f,
    output: m[1] + ".out",
    config_files: []
  };
});

// now find all configuration files for all tests
Object.keys(tests).forEach(function(test) {
  var re = new RegExp('^' + test + '.*\.json$');
  files.forEach(function(f) {
    if (re.test(f)) tests[test].config_files.push(f);
  });
  tests[test].config_files.sort();
});

console.log(tests);
