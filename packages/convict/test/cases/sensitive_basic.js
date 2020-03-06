'use strict';

exports.conf = {
  public: {
    format: String,
    default: 'public',
    doc: 'A public value'
  },
  privateString: {
    format: String,
    default: 'private',
    doc: 'A sensitive string',
    sensitive: true
  },
  privateNat: {
    format: 'nat',
    default: 1,
    doc: 'A sensitive natural number',
    sensitive: true
  },
  privateNull: {
    default: null,
    doc: 'A sensitive value that defaults to null',
    sensitive: true
  }
};
