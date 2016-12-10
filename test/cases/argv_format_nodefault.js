'use strict';

exports.conf = {
  url: {
    default: null,
    format: function(value) {
      if (value == null) {
        throw new Error('The url argument must be provided');
      }
    },
    arg: 'url'
  }
};

exports.argv = '--url www.github.com';
