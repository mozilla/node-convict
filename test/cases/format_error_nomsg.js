'use strict';

exports.conf = {
  noDefault: {
    default: null,
    format: function(value) {
      throw new Error();
    }
  }
};
