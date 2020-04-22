'use strict'
/*eslint no-sync: 0*/

const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const diff = require('deep-object-diff').diff

// This test finds its cases in /test/cases
const cases_dir_path = path.join(__dirname, 'cases')
const files = fs.readdirSync(cases_dir_path)

const tests = {}
files.forEach(function(f) {
  const m = /^([a-zA-Z_\-0-9]+)\.js$/.exec(f)
  if (m) {
    tests[m[1]] = {
      spec: f,
      output: m[1] + '.out',
      outputString: m[1] + '.string',
      outputSchema: m[1] + '.schema',
      config_files: []
    }
  }
})

// now find all configuration files for all tests
Object.keys(tests).forEach(function(test) {
  const re = new RegExp('^' + test + '.*\\.json$')
  files.forEach(function(f) {
    if (re.test(f)) {
      tests[test].config_files.push(path.join(cases_dir_path, f))
    }
  })
  tests[test].config_files.sort()
})

function diffObjects(a, b) {
  const res = diff(a, b)
  if (Object.keys(res).length) {
    return 'mismatch: ' + JSON.stringify(res, null, 4)
  }
  return null
}

// time to run!
const toRun = Object.keys(tests)

function run(name, done) {
  const test = tests[name]

  const kase = require(path.join(cases_dir_path, test.spec))

  const env = kase.env || {}
  let argv = kase.argv || []
  if (!Array.isArray(argv)) {
    argv = argv.split(' ')
  }
  let exec = path.join(__dirname, 'lib/runner.js')
  if (process.env.running_under_istanbul) {
    argv = ['cover', '--report', 'none', '--print', 'none', '--include-pid',
      exec, '--'].concat(argv)
    exec = path.join(__dirname, '..', 'node_modules', '.bin', 'istanbul')
  }

  const n = cp.fork(exec, argv, {env: env})

  n.on('message', function(m) {
    if (m.ready) {
      n.send(tests[name])
      return
    }

    let expected
    let got
    const errs = []
    try {
      if (!m.error) {
        // let's read the expected output
        expected = JSON.parse(fs.readFileSync(path.join(cases_dir_path, test.output)))
        got = m.result

        // check that configuration is what we expect
        const err = diffObjects(expected, got)
        if (err) {
          errs.push(`get ${err}`)
        }

        if (fs.existsSync(path.join(cases_dir_path, test.outputString))) {
          expected = JSON.parse(fs.readFileSync(path.join(cases_dir_path, test.outputString)))
          got = JSON.parse(m.string)
          const err = diffObjects(expected, got)
          if (err) {
            errs.push(`toString ${err}`)
          }
        }

        if (fs.existsSync(path.join(cases_dir_path, test.outputSchema))) {
          expected = JSON.parse(fs.readFileSync(path.join(cases_dir_path,
            test.outputSchema)))
          got = m.schema
          const err = diffObjects(expected, got)
          if (err) {
            errs.push(`getSchema ${err}`)
          }
        }

        if (errs.length > 0) {
          throw new Error(errs.join('\n'))
        }
        return done()
      } else {
        expected = fs.readFileSync(path.join(cases_dir_path, test.output)).toString().trim()
        got = m.error.trim()
        // EOL for new line and windows support:
        expected = expected.split(require('os').EOL).join('\n')
        require('assert').strictEqual(got, expected, `must be pass ${name}`)
        return done()
      }
    } catch (e) {
      return done(e)
    }
  })
}

describe('CLI tests', function() {
  toRun.forEach(function(name) {
    test(name, function(done) {
      run(name, done)
    })
  })
})
