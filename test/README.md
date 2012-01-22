## Organization

underneath `cases/` live test cases.  Each test case consists of the
following:

  * `test.js` - a javascript which exports the configuration spec and process environment.
  * `test_xxx.json` - one or more JSON configuration files interpreted in sorted order
  * `test.out` - a JSON file containing the expected final configuration, or error string
