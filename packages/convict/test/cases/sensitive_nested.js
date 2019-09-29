'use strict';

exports.conf = {
  item: {
    format: String,
    default: 'public',
    doc: 'A public value'
  },
  parent: {
    item: {
      format: String,
      default: 'private',
      doc: 'A nested sensitive value',
      sensitive: true
    }
  }
};
