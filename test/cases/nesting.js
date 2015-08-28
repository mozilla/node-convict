exports.conf = {
  top: {
    middle: {
      leaf: 'foo',
      leaf2: {
        default: 'bar',
        doc: 'a second leaf'
      }
    },
    internal_leaf: 'baz'
  }
};
