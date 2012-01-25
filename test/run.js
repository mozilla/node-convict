#!/usr/bin/env node

const
fs = require('fs'),
path = require('path'),
convict = require('../lib/convict.js'),
cp = require('child_process');

const casesDir = path.join(__dirname, 'cases');
var files = fs.readdirSync(casesDir);

var tests = {};
files.forEach(function(f) {
  var m = /^([a-zA-Z_\-0-9]+)\.js$/.exec(f);
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

// NOTE: there are several object diff implementations to
// choose from which could do a better diff and generate better
// output
function diffObjects(a, b) {
  if (JSON.stringify(a) != JSON.stringify(b)) return "objects are different";
  return null;
}

// time to run!
var passed = 0;
var toRun = Object.keys(tests);

function runOne() {
  if (!toRun.length) return;
  var name = toRun.shift();

  var test = tests[name];
  process.stdout.write(name + " - ");

  var env = require(path.join(casesDir, test.spec)).env || {};
  
  var n = cp.fork(path.join(__dirname + '/runner.js'), null, { env: env });

  n.on('message', function(m) {
    try {
      if (!m.error) {
        // let's read the expected output
        var expected = JSON.parse(fs.readFileSync(path.join(casesDir, test.output)));
        var got = m.result;

        console.log("expected", expected);
        console.log("got", got);

        // check that configuration is what we expect
        var err = diffObjects(got, expected);
        if (err) throw err;
        
        passed++;
        process.stdout.write("ok");
      } else {
        throw m.error;
      }
    } catch(e) {
      process.stdout.write("fail (" + e + ")");
    }
    process.stdout.write("\n");
    runOne();
  });

  n.send(tests[name]);
};

runOne();
