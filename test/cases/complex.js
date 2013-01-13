exports.conf = {
  env: {
    format: ["production", "local"],
    default: "production",
    env: "NODE_ENV"
  },
  URL: {
    format: String,
    default: "https://browserid.org",
    env: 'URL'
  },
  use_minified_resources: true,
  var_path: "/home/browserid/var",
  database: {
    driver: {
      default: "mysql",
      format: ["json", "mysql"]
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
  authentication_duration: "2 weeks",
  certificate_validity: "1 day",
  min_time_between_emails: "1 minute",
  max_compute_duration: "10 seconds",
  disable_primary_support: false,
  enable_code_version: false,
  default_lang: [ 'en-US' ],
  supported_languages: [ 'en-US' ],
  locale_directory: "locale",
  express_log_format: "default"
};
