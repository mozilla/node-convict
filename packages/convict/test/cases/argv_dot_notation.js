'use strict';

exports.conf = {
  server: {
    port: {
      default: 8080,
      format: 'port',
      arg: 'server.port'
    }
  },
  ui: {
    port: {
      default: 3000,
      format: 'port',
      arg: 'ui.port'
    }
  }
};

exports.argv = '--server.port 5000 --ui.port 4000';
