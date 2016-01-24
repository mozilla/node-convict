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

