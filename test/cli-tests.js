'use strict';
/*eslint no-sync: 0*/

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const obj_diff = require('obj_diff');

const casesDir = path.join(__dirname, 'cases');
let files = fs.readdirSync(casesDir);

let tests = {};
files.forEach(function(f) {
  let m = /^([a-zA-Z_\-0-9]+)\.js$/.exec(f);
  if (m) tests[m[1]] = {
    spec: f,
    output: m[1] + '.out',
    outputString: m[1] + '.string',
    outputSchema: m[1] + '.schema',
    config_files: []
  };
});

// now find all configuration files for all tests
Object.keys(tests).forEach(function(test) {
  let re = new RegExp('^' + test + '.*\\.json$');
  files.forEach(function(f) {
    if (re.test(f)) tests[test].config_files.push(path.join(casesDir, f));
  });
  tests[test].config_files.sort();
});

// NOTE: there are several object diff implementations to
// choose from which could do a better diff and generate better
// output
function diffObjects(a, b) {
  let diff = obj_diff(a,b);
  if (Object.keys(diff).length) {
    return 'mismatch: ' + JSON.stringify(diff, null, 4);
  }
  return null;
}

// time to run!
let toRun = Object.keys(tests);

function run(name, done) {
  let test = tests[name];

  let kase = require(path.join(casesDir, test.spec));

  let env = kase.env || {};
  let argv = kase.argv || [];
  if (!Array.isArray(argv)) {
    argv = argv.split(' ');
  }
  let exec = path.join(__dirname, 'lib/runner.js');
  if (process.env.running_under_istanbul) {
    argv = ['cover', '--report', 'none', '--print', 'none', '--include-pid',
      exec, '--'].concat(argv);
    exec = path.join(__dirname, '..', 'node_modules', '.bin', 'istanbul');
  }

  let n = cp.fork(exec, argv, {env: env});

  n.on('message', function(m) {
    if (m.ready) {
      n.send(tests[name]);
      return;
    }

    let expected;
    let got;
    let errs = [];
    try {
      if (!m.error) {
        // let's read the expected output
        expected = JSON.parse(fs.readFileSync(path.join(casesDir, test.output)));
        got = m.result;

        // check that configuration is what we expect
        let err = diffObjects(expected, got);
        if (err) {
          errs.push(`get ${err}`);
        }

        if (fs.existsSync(path.join(casesDir, test.outputString))) {
          expected = JSON.parse(fs.readFileSync(path.join(casesDir, test.outputString)));
          got = JSON.parse(m.string);
          let err = diffObjects(expected, got);
          if (err) {
            errs.push(`toString ${err}`);
          }
        }

        if (fs.existsSync(path.join(casesDir, test.outputSchema))) {
          expected = JSON.parse(fs.readFileSync(path.join(casesDir,
            test.outputSchema)));
          got = m.schema;
          let err = diffObjects(expected, got);
          if (err) {
            errs.push(`getSchema ${err}`);
          }
        }

        if(errs.length > 0) {
          throw new Error(errs.join('\n'));
        }
        return done();
      } else {
        expected = fs.readFileSync(path.join(casesDir, test.output)).toString().trim();
        got = m.error.trim();
        if (expected.trim() !== got.trim()) throw got;
        return done();
      }
    } catch(e) {
      return done(e);
    }
  });
}

describe('CLI tests', function() {
  toRun.forEach(function(name) {
    it(name, function(done) {
      run(name, done);
    });
  });
});
