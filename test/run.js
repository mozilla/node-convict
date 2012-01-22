#!/usr/bin/env node

const
fs = require('fs'),
path = require('path'),
convict = require('./lib/convict.js');

const casesDir = path.join(__dirname, 'cases');
var files = fs.readdirSync(casesDir);

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

// time to run!
var passed = 0;
Object.keys(tests).forEach(function(name) {
  var test = tests[name];
  process.stdout.write(name + " - ");
  
  try {
    var spec = fs.readFileSync(path.join(casesDir, test.spec));
    spec = eval(spec);
    
    // XXX read environment

    // process spec
    var conf = convict(spec);

    // XXX - par

    passed++;
    process.stdout.write("ok");
  } catch(e) {
    process.stdout.write("fail (" + e + ")");
  }
  process.stdout.write("\n");
});
