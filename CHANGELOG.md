# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [4.4.1] - 2018-12-15
### Fixed

- Fix README for addFormats #268, #275 (Walter Rumsby @wrumsby, Sebastian Yandun
  @svyandun, Eray Hanoglu @erayhanoglu, Marc-Aurèle Darche @madarche)

### Changed

- Update deps (yargs-parser, validator) (Marc-Aurèle Darche @madarche)

## [4.4.0] - 2018-09-22
### Fixed

- Fixed dot notation parsing by disabling dot-notation option in yarg-parser #269 (Patrick Shaw @PatrickShaw)

### Added

- Pass the name of the property being assigned to the custom coerce function #262 (Dan Allen mojavelinux)

## [4.3.2] - 2018-07-19
### Fixed

- Update deps (validator.js@10.4.0, yargs-parser@10.1.0, coveralls@3.0.2) fixes #264 (Marc-Aurèle Darche @madarche)

## [4.3.1] - 2018-06-07
### Fixed

- Handle loading empty files #257 (Paul Colleoni @polco)

## [4.3.0] - 2018-06-02
### Fixed

- Allow argument value to be falsy #246 (Dan Allen @mojavelinux)

### Added

- Accept args and env as parameters to convict function #223 (Dan Allen @mojavelinux)
- Allow the default parser to be set #248 (Dan Allen @mojavelinux)
- Add package-lock.json file (Marc-Aurèle Darche @madarche)

### Changed

- Update deps (almost all) (Marc-Aurèle Darche @madarche)

### Removed

- Remove browserify package and configuration. This was never needed. (Marc-Aurèle Darche @madarche)

## [4.2.0] - 2018-03-23
### Added

- Enhanced file formats support #244 (Tuan Nguyen @rocketspacer)

### Changed

- Fix doc (Marc-Aurèle Darche @madarche)

## [4.1.0] - 2018-03-15
### Changed

- Make warnings more visible by coloring them #242 (Nawfel @NawfelBgh)

### Fixed
- Fix custom format object nested properties warning by checking for the item
  type instead of item format #234 (Helias Criouet @Helias-Criouet)
- Fix README on how cli args work #226 (Ian Chadwick @ianchadwick)

## [4.0.2] - 2017-11-30
### Security

- Update moment to fixed security version #231 (Marc-Aurèle Darche @madarche)

## [4.0.1] - 2017-09-17
### Changed

- Update dependencies #220 (Marc-Aurèle Darche @madarche)
- Move away from minimist to yargs-parser #219 (Marc-Aurèle Darche @madarche)
- Corrected a typo #218 (Nikolay Govorov @nikolay-govorov)
- Fix issue with empty string over default not null value #217 (Jonathan Petitcolas @jpetitcolas)
- Ensure property defaults are not modified #216 (Eli Young @elyscape)
- Nested props in 'object' values are not undeclared #215 (Michael McGahan @mmcgahan)

## [4.0.0] - 2017-06-22
### Added

- Handle shorthand for default empty objects #194 (Eli Young @elyscape)
- 100% test coverage #192 (Eli Young @elyscape)
- Include static tests in code coverage checks #191 (Eli Young @elyscape)
- Add support for masking sensitive values #190 (Eli Young @elyscape)
- Support mapping env vars to multiple settings #189 (Richard Marmorstein @twitchard)

### Changed

- Rework validate() to check for overridden parent #206 (Eli Young @elyscape)
- Document that a JSON/JSON5 schema file can be used #198 (Marc-Aurèle Darche @madarche)
- Better advertize CLI tests as such #197 (Marc-Aurèle Darche @madarche)
- Support arbitrary casing of booleans #195 (Eli Young @elyscape)

### Removed

- Remove the npm-shrinkwrap.json file #210 (Marc-Aurèle Darche @madarche)

### Fixed

- Fix documentation for config.loadFile() #207 (Eli Young @elyscape)
- Tests env/arg type coercion and fix arg number coercion #199 (Eli Young @elyscape)
- Make schema objects actually useful #196 (Eli Young @elyscape)

## [3.0.0] - 2017-03-16
### Added

- In `validate` function alter option `strict` to `allowed`, with option values `strict` and `warn` #182 (@benTrust)

### Changed

- Rename pipe formats to emphasize that they are for windows pipes #179
  (Gurpreet Atwal @gurpreetatwal)
- Update dependencies #184 (Marc-Aurèle Darche @madarche)

## [2.0.0] - 2016-12-18

- Named Pipe Support #175 (Gurpreet Atwal @gurpreetatwal)
- Stop supporting Node.js 0.12 by december 2016 #166 (Marc-Aurèle Darche @madarche)
- Stop supporting Node.js 0.10 by october 2016 #164 (Marc-Aurèle Darche @madarche)
- Remove deprecated methods `root` and `toSchemaString`
- Deps: validator@6.2.0
- Deps: moment@2.17.1
- Deps: json5@0.5.1
- devDeps: all up-to-date

## [1.5.0] - 2016-09-28

- Add `RegExp` format #165 (@philbooth)

## [1.4.0] - 2016-05-29

- Add new reset method #148 (Marc-Aurèle Darche @madarche)
- Replace optimist which is deprecated #154 (Brian Vanderbusch @LongLiveCHIEF)
- Move varify to optionalDependencies #153 (@mlucool)

## [1.3.0] - 2016-04-07

- Replace cjson with json5 (@ratson)
- Fix missing npm-shrinkwrap.json file in published NPM module

## [1.2.0] - 2016-04-01

- Support for built-in formats in schema files #138 (Hem Brahmbhatt @damnhipster)
- Improve stability and security: Use shrinkwrap to lock module dependencies #139 (Marc-Aurèle Darche @madarche)
- devDeps: coveralls@2.11.9 to stay in sync
- devDeps: eslint@2.5.3 to stay in sync

## [1.1.3] - 2016-03-18

- Fix Null default with custom validator causes json parse error #122 (@RoboPhred)
- Documentation improvement (Brian Vanderbusch @LongLiveCHIEF)
- Deps: moment@2.12.0 to stay in sync
- devDeps: coveralls@2.11.8 to stay in sync
- devDeps: eslint@2.4.0 to stay in sync
- devDeps: mocha-lcov-reporter@1.2.0 to stay in sync

## [1.1.2] - 2016-02-12

- Documentation and management script fixes; no code changes.

## [1.1.1] - 2016-02-05

- Deps: moment@2.11.2 to fix
  https://nodesecurity.io/advisories/moment_regular-expression-denial-of-service
- Deps: validator@4.6.1 to stay in sync

## [1.1.0] - 2016-02-02

- Fix loading consecutive files could cause an error to be thrown #111
  (Abdullah Ali @voodooattack)
- Coerce values loaded from a file #96 (Jens Olsson @jsol)
- Improvement: Pass instance to coerce #109 (Abdullah Ali @voodooattack)
- Fix missing return in validate reducer #101 (Kris Reeves @myndzi)
- Deps: moment
- Deps: validator
- Switch back from Blanket to Istanbul for test coverage (Marc-Aurèle Darche @madarche)
- Stricter JSLint linting (Marc-Aurèle Darche @madarche)
- Improve documentation (Olivier Lalonde @olalonde, Marc-Aurèle Darche @madarche)

## [1.0.2] - 2015-12-09

- Merge pull request [#97](https://github.com/mozilla/node-convict/issues/97) from yoz/cjson-0.3.2
  Update cjson dependency to 0.3.2
- Update cjson dependency to 0.3.2
  This removes the transitive dependency on 'jsonlint' (in favor of json-parse-helpfulerror), which avoids its problems with unstated depdendencies on 'file' and 'system'.
- Coerce values loaded from a file
  Previously values were coerced if added through
  set(), command line arguments or env arguments.
  Added the schema to the recursive overlay function
  so that values added through load() and loadFile()
  are also coerced.
  Corrected a test to reflect this.
- Deps: update all
- Switch from JSHint to ESLint

## [1.0.1] - 2015-08-11

- Merge pull request [#87](https://github.com/mozilla/node-convict/issues/87) from mozilla/rfk/duration-integer-string
  Accept integer millisecond durations in string form, e.g. from env vars.
- Accept integer millisecond durations in string form, e.g. from env vars.

## [1.0.0] - 2015-08-01

- Merge pull request [#85](https://github.com/mozilla/node-convict/issues/85) from madarche/feat-1.0
  v1.0.0 and remove old deprecated formats ipv4 and ipv6
- Better wording for validate options
- Consistency using periods
- Improve feature description again
- Improved features description
- Better config.validate([options]) doc + beautify
- Update dependencies
- Merge branch 'feat-update-dependencies' into feat-1.0
- v1.0.0 Remove old deprecated formats ipv4 and ipv6

## [0.8.2] - 2015-07-20

- Merge pull request [#84](https://github.com/mozilla/node-convict/issues/84) from madarche/feat-update-deps
  Update dependencies
- Update dependencies

## [0.8.1] - 2015-07-20

- Merge pull request [#82](https://github.com/mozilla/node-convict/issues/82) from myndzi/fix-license
  Update package.json 'license' key format
- Merge pull request [#83](https://github.com/mozilla/node-convict/issues/83) from madarche/feat-get-properties
  Document and test properties and schema export
- Document and test properties and schema export
  This modification also renames the previously undocumented and untested
  following methods:
  * root→getProperties and
  * toSchemaString→getSchemaString
  The renaming was done for clearer intent and consistency in naming. The
  previous method names are still supported but deprecated.
- Update package.json 'license' key format
- Merge pull request [#80](https://github.com/mozilla/node-convict/issues/80) from madarche/fix-nested-schema-doc
  Document nested settings in schema
- Merge pull request [#79](https://github.com/mozilla/node-convict/issues/79) from madarche/fix-doc
  Document new strict validation mode
- Document nested settings in schema
  Fixes [#78](https://github.com/mozilla/node-convict/issues/78)
- Document new strict validation mode
  Fixes [#75](https://github.com/mozilla/node-convict/issues/75)
- Merge pull request [#77](https://github.com/mozilla/node-convict/issues/77) from madarche/fix-test_coverage
  Fix test coverage
- Fix test coverage
  The rationale in this change is to put logic as less as possible in
  .travis.yml since it's not testable on developers' system.
- Merge pull request [#76](https://github.com/mozilla/node-convict/issues/76) from madarche/feat-update_dependencies
  Update dependencies
- Merge pull request [#74](https://github.com/mozilla/node-convict/issues/74) from mmerkes/master
  Fixes [#73](https://github.com/mozilla/node-convict/issues/73), removes validator.check from README.md and adds valid form…
- Update dependencies
- Adds convict.addFormat() to validation section of README and tidies up section
- Fixes [#73](https://github.com/mozilla/node-convict/issues/73), removes validator.check from README.md and adds valid format checker

## [0.8.0] - 2015-05-31

- Merge pull request [#64](https://github.com/mozilla/node-convict/issues/64) from umar-muneer/master
  Strict Validation Mode Added
- Merge pull request [#72](https://github.com/mozilla/node-convict/issues/72) from pdehaan/patch-2
  Fix typos in README
- Fix typos in README

## [0.7.0] - 2015-04-29

- Merge pull request [#66](https://github.com/mozilla/node-convict/issues/66) from collinwat/add-format-overload
  addFormat supports object arguments as well as function arguments
- Merge pull request [#70](https://github.com/mozilla/node-convict/issues/70) from madarche/fix-update-deps
  Update dependencies and removed `should` replaced
- Merge pull request [#69](https://github.com/mozilla/node-convict/issues/69) from madarche/feat-new-nodejs-0.12
  Make CI test Node.js 0.12, the new stable
- Update dependencies and removed `should` replaced
  `should` has been replaced by `js-must`.
- Make CI test Node.js 0.12, the new stable
- Merge pull request [#61](https://github.com/mozilla/node-convict/issues/61) from ronjouch/browserifyTransformVarify
  Add 'varify' browserify transform to support IE9,10
- Add format supports object arguments as well as function arguments
- Merge pull request [#62](https://github.com/mozilla/node-convict/issues/62) from madjid04/master
  Add code coverage with blanket
- Strict Validation Mode
  1. Added a fix for nested validation checks.
  2. Modified test case schema and config files.
- Strict Validation Mode Added
  1. Added a Strict Validation mode. If set to true, any properties
  specified in config files that are not declared in the schema will
  result in errors. This is to ensure that the schema and the config
  files are in sync. This brings convict further in line with the concept
  of a “Schema”. By default the strict mode is set to false.
  2. Added test cases for strict mode
- modification of the indentation

## [0.6.1] - 2015-01-12

- Fix duration check #54
- Update dependencies #48
- Use js-must a safer test assertion library #49

## [0.6.0] - 2014-11-14

- Update dependencies (including latest validator) #46
- Deprecate "ipv4" and "ipv6" formats

## [0.5.1] - 2014-10-29

- Update dependencies
- Use fix versions everywhere for safe validation
- More readable date for test #43

## [0.5.0] - 2014-10-15

- Fix npmignore anything that's not needed for production #38
- Fix The schema get modified by convict #37
- npm ignore things
- JSHint lint + 80 cols formatting #39

## [0.4.3] - 2014-10-13

- Test the correct convict object for the undefined attribute #31
- Update moment.js to 2.6.0 #36

## [0.4.2] - 2014-01-12

- Update cjson 0.2.1 —> 0.3.0
- Coerce 'nat' formatted values #26
- Updat canonical package.json URLs #24
- Fix 'should handle timestamp' failing test #21
- Update package.json #43
- Add license info
  * Update Dependency #18

## [0.4.1] - 2013-10-14

- Support JSON formatted objects in env

## [0.4.0] - 2013-07-31

## [0.3.3] - 2013-06-18

## [0.3.1] - 2013-06-04

## [0.3.0] - 2013-06-03

## [0.2.3] - 2013-05-27

## [0.2.2] - 2013-05-25

## [0.2.1] - 2013-05-25

## [0.2.0] - 2013-05-23

## [0.1.1] - 2013-05-19

## [0.1.0] - 2013-03-05

Initial release
