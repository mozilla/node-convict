exports.conf = {
  env: {
    format: ['production', 'local'],
    default: 'production',
    env: 'NODE_ENV'
  },
  URL: {
    format: String,
    default: 'https://browserid.org',
    env: 'URL'
  },
  use_minified_resources: true,
  var_path: '/home/browserid/var',
  database: {
    driver: {
      default: 'mysql',
      format: ['json', 'mysql']
    },
    user: 'browserid',
    create_schema: true,
    may_write: false
  },
  statsd: {
    enabled: true
  },
  bcrypt_work_factor: {
    default: 12,
    format: 'nat'
  },
  authentication_duration: {
    default: '2 weeks',
    format: 'duration'
  },
  certificate_validity: {
    default: '1 day',
    format: 'duration'
  },
  min_time_between_emails: {
    default: '1 minute',
    format: 'duration'
  },
  max_compute_duration: {
    default: '10 seconds',
    format: 'duration'
  },
  disable_primary_support: false,
  enable_code_version: false,
  default_lang: [ 'en-US' ],
  supported_languages: [ 'en-US' ],
  locale_directory: 'locale',
  express_log_format: 'default'
};
