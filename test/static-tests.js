const
fs = require('fs'),
path = require('path'),
convict = require('../lib/convict.js'),
cp = require('child_process'),
obj_diff = require('obj_diff'),
mocha = require('mocha');

mocha.Suite('static tests');

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
    if (re.test(f)) tests[test].config_files.push(path.join(casesDir, f));
  });
  tests[test].config_files.sort();
});

// NOTE: there are several object diff implementations to
// choose from which could do a better diff and generate better
// output
function diffObjects(a, b) {
  var diff = obj_diff(a,b);
  if (Object.keys(diff).length) {
    return "mismatch: " + JSON.stringify(diff, null, 4);
  }
  return null;
}

// time to run!
var toRun = Object.keys(tests);

function run(name, done) {
  var test = tests[name];

  var kase = require(path.join(casesDir, test.spec));

  var env = kase.env || {};
  var argv = kase.argv ? kase.argv.split(' ') : [];

  var n = cp.fork(path.join(__dirname + '/runner.js'), argv, { env: env });

  n.on('message', function(m) {
    try {
      if (!m.error) {
        // let's read the expected output
        var expected = JSON.parse(fs.readFileSync(path.join(casesDir, test.output)));
        var got = m.result;

        // check that configuration is what we expect
        var err = diffObjects(expected, got);
        if (err) throw err;
        return done();
      } else {
        var expected = fs.readFileSync(path.join(casesDir, test.output)).toString().trim();
        var got = m.error.trim();
        if (expected.trim() !== got.trim()) throw got;
        return done();
      }
    } catch(e) {
      done(e);
    }
  });

  n.send(tests[name]);
};

describe('Static tests', function() {
  toRun.forEach(function(name) {
    it(name, function(done) {
      run(name, done);
    });
  });
});
