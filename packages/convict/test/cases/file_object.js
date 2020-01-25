'use strict';

exports.conf = {
  single: {
    format: Object,
    default: { test: 0 }
  },
  nested: {
    object: {
      doc: 'Variable configuration.',
      format: Object,
      default: {}
    }
  }
};
exports.data = {
  single: {
    test: 2,
    additionalItem: [1, 2, 3]
  },
  nested: {
    object: {
      nestedValue: 'Value'
    }
  }
};