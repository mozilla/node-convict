exports.conf = {
  top: {
    middle: {
      leaf: 'string = "foo"',
      leaf2: {
        format: 'string = "bar"',
        doc: "a second leaf"
      }
    },
    internal_leaf: 'string = "baz"'
  }
};
