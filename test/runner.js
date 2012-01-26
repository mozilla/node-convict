const
convict = require('../lib/convict.js'),
path = require('path');

process.on('message', function(spec) {
  try {
    var s = require(path.join(__dirname, 'cases', spec.spec));
    var conf = convict(s.conf).loadFile(spec.config_files).validate();
    process.send({result: conf.get()});
    process.exit(0);
  } catch(e) {
    process.send({error: e.toString() });
    process.exit(1);
  }
});

