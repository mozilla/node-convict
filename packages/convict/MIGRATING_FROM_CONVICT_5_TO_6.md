# Migrating from Convict 5 to 6

The main goal of `convict@6.0.0` was to make it have less dependencies by
default, so to make it less impacted by security vulnerabilites in those
dependencies. So this release introduced the following BREAKING changes:

* Multi-packages split. There are now 3 packages: `convict`,
  `convict-format-with-validator`, `convict-format-with-moment`
* Removal of the `json5` dependency to make it an optional

Old pre-`convict@6.0.0` code:

```javascript
const convict = require('convict')

const config = convict(config_schema)
```

New  post-`convict@6.0.0` code:

```javascript
const convict = require('convict')
const convict_format_with_validator = require('convict-format-with-validator')
const convict_format_with_moment = require('convict-format-with-moment')
const JSON5 = require('json5')

// Use this only if you use the "email", "ipaddress" or "url" format
convict.addFormats(convict_format_with_validator)

// Use this only if you use the "duration" or "timestamp" format
convict.addFormats(convict_format_with_moment)

// Use this only if you have a .json configuration file in JSON5 format
// (i.e. with comments, etc.).
convict.addParser({extension: 'json', parse: JSON5.parse})

const config = convict(config_schema)
```
