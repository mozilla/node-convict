exports.conf = {
  env: {
    format: 'string ["production", "local"] = "local"',
    env: "NODE_ENV",
    doc: "The environment that we're running in."
  },
  URL: {
    format: 'string = "https://browserid.org"',
    env: "URL",
    doc: "The externally visible url of the server",
  },
  use_minified_resources: {
    format: "boolean = false;",
    doc: "All resources should be combined and minified",
    env: "MINIFIED"
  },
  var_path: {
    format: 'string = "/home/browserid/var"',
    doc: "The path the the 'var' directory, where logs and such will go"
  }
};
