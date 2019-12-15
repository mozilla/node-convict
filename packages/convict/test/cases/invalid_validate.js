'use strict';

exports.conf = {
  invalidValidator: {
    format: 'invalidValidator',
    default: 'invalidValidator',
    doc: 'A value with an invalid validator'
  }
};

exports.formats = {
  invalidValidator: {
    coerce: function(value) { return value; }
  }
};
