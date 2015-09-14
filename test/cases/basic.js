exports.conf = {
  env: {
    format: ['production', 'local'],
    default: 'local',
    env: 'NODE_ENV',
    doc: 'The environment that we\'re running in.'
  },
  URL: {
    format: String,
    default: 'https://browserid.org',
    env: 'URL',
    doc: 'The externally visible url of the server'
  },
  use_minified_resources: {
    format: Boolean,
    default: false,
    doc: 'All resources should be combined and minified',
    env: 'MINIFIED'
  },
  var_path: {
    format: String,
    default: '/home/browserid/var',
    doc: 'The path the the "var" directory, where logs and such will go'
  }
};
