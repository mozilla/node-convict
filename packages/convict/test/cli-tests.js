'use strict';
/*eslint no-sync: 0*/

const chai = require('chai');
const expect = chai.expect;

const fs = require('fs');
const path = require('path');

// This test finds its cases in /test/cases
const cases_dir_path = path.join(__dirname, 'cases');
let files = fs.readdirSync(cases_dir_path);

const config_files = {};
files.forEach(function(filename) {
  let match = /^([a-zA-Z_\-0-9]+)\.js$/.exec(filename);
  if (match) {
    const name = match[1];
    config_files[name] = [];
  }
});

// now find all configuration files for all tests
Object.keys(config_files).forEach(function(name) {
  let reg = new RegExp('^' + name + '.*\\.json$');
  files.forEach(function(filename) {
    if (reg.test(filename)) {
      config_files[name].push(path.join(cases_dir_path, filename));
    }
  });
  config_files[name].sort();
});

// time to run!
let toRun = Object.keys(config_files);

describe('CLI tests', function() {
  toRun.forEach(function(name) {
    describe(name, function() {
      const output = {};

      const expectedOutput = (() => {
        if (files.indexOf(name + '.out.js') !== -1) {
          return require(path.join(cases_dir_path, name + '.out.js'));
        } else {
          const expected = fs.readFileSync(path.join(cases_dir_path, name + '.out')).toString();
          // EOL for new line and windows support:
          return expected.trim().split(require('os').EOL).join('\n');
        }
      })();

      const state = (typeof expectedOutput === 'string') ? 'throw' : 'not throw';
      let conf;

      it('Convict must ' + state, function() {
        function init() {
          const convict = new_require('../');
          const settings = require(path.join(__dirname, 'cases', name + '.js'));

          if (settings.formats) {
            if (Array.isArray(settings.formats)) {
              settings.formats.forEach(function(formats) {
                convict.addFormats(formats);
              });
            } else {
              convict.addFormats(settings.formats);
            }
          }

          const opts = {};

          if (settings.env) {
            opts.env = settings.env;
          }

          if (settings.argv) {
            opts.args = settings.argv;
          }

          conf = convict(settings.conf, opts);
          conf.loadFile(config_files[name]);
          conf.validate();
        }

        if (typeof expectedOutput === 'string') {
          output.error = true;
          expect(function() {
            init();
          }).to.throw(expectedOutput);
        } else {
          expect(function() {
            init();
          }).to.not.throw();
        }
      });

      it('must return the expected configuration object', function() {
        if (!output.error) {
          expect(conf.get()).to.deep.equal(expectedOutput);
        }
      });

      it('stringify configuration object', function() {
        if (files.indexOf(name + '.string') !== -1) {
          const expected = JSON.parse(fs.readFileSync(path.join(cases_dir_path, name + '.string')));

          expect(JSON.parse(conf.toString())).to.deep.equal(expected);
        }
      });

      it('check schema', function() {
        if (files.indexOf(name + '.schema') !== -1) {
          const expected = JSON.parse(fs.readFileSync(path.join(cases_dir_path, name + '.schema')));

          expect(conf.getSchema()).to.deep.equal(expected);
        }
      });
    });
  });
});

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
