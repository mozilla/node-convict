# Organization

Underneath `cases` live test cases. Each case consists of the following:

* `test.js` - a javascript which exports the configuration spec and process environment
* `test_xxx.json` - one or more JSON configuration files interpreted in sorted order
* `test.out` or `test.out.js`: `.out` if error, `.out.js` if success:
  - `.out` a TXT file containing the error string
  - `.out.js` a JS file containing the expected final configuration object
