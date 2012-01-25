module.exports = {
  env: {
    format: 'string ["production", "local"]',
    env: "NODE_ENV"
  },
  URL: {
    format: 'string = "https://browserid.org"',
    env: 'URL'
  },
  use_minified_resources: 'boolean = true',
  var_path: 'string = "/home/browserid/var"',
  database: {
    driver: 'string ["json", "mysql"] = "mysql"',
    user: 'string',
    create_schema: 'boolean',
    may_write: 'boolean'
  },
  statsd: {
    enabled: 'boolean'
  },
  bcrypt_work_factor: "integer[6,20] = 12",
  authentication_duration: 'string = "2 weeks"',
  certificate_validity: 'string = "1 day"',
  min_time_between_emails: 'string = "1 minute"',
  max_compute_duration: 'string = "10 seconds"',
  disable_primary_support: 'boolean = false',
  enable_code_version: 'boolean = false',
  default_lang: 'array { string; }',
  supported_languages: 'array { string; }',
  locale_directory: 'string = "locale"',
  express_log_format: 'string = "default"'
};
