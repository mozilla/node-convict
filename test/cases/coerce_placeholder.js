exports.conf = {
  env: {
    format: ['production', 'local'],
    default: 'local',
    env: 'NODE_ENV',
    doc: 'The environment that we\'re running in.'
  },
  nested: {
    value: {
      format: String,
      default: 'root',
      doc: 'Nested value.'
    }
  },
  root: {
    format: 'placeholder',
    default: '/path/to/${nested.value}',
    doc: 'The path to the root directory.'
  },
  configPath: {
    format: 'placeholder',
    default: '${root}/config',
    doc: 'Path to configuration files. Defaults to ${root}/config/'
  },
  config: {
    format: 'placeholder',
    default: '${configPath}/${env}.json',
    doc: 'Path to configuration file. Defaults to ${configPath}/${env}.json'
  }
};

exports.env = {
  env: 'local'
};

exports.formats = {
  placeholder: {
    validate: function() { },
    coerce: function(value, config) {
      return value.replace(/\$\{([\w\.]+)}/g, function(v,m) { return config.get(m); });
    }
  }
};
