'use strict';

const convict = require('../../lib/convict'),
  path = require('path');

/*eslint no-process-exit: 0*/

process.on('message', function(spec) {
  try {
    let s = require(path.join(__dirname, '../cases', spec.spec));
    if (s.formats)
      convict.addFormats(s.formats);
    let conf = convict(s.conf).loadFile(spec.config_files).validate();
    process.send({
      result: conf.get(),
      string: conf.toString(),
      schema: conf.getSchema()
    });
    process.exit(0);
  } catch(e) {
    console.error(e); // eslint-disable-line no-console
    process.send({error: e.message });
    process.exit(1);
  }
});

// Tell the parent process that the runner is ready to perform work. This is
// necessary because, when run under Istanbul, the runner takes long enough to
// start that it misses messages sent immediately post-fork.
process.send({ready: true});
