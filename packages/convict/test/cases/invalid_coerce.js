'use strict';

exports.conf = {
  invalidCoercer: {
    format: 'invalidCoercer',
    default: 'invalidCoercer',
    doc: 'A value with an invalid coercer'
  }
};

exports.formats = {
  invalidCoercer: {
    validate: function() {},
    coerce: true
  }
};
