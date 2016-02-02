CONTRIBUTING
============

Pull Requests and contributions in general are welcome as long as they follow
the [Node aesthetic].

[Node aesthetic]: http://substack.net/node_aesthetic

Code style
----------

Coding style is described through EditorConfig and enforced by ESLint.

Running the following command line will help you to conform your newly written
code:

```bash
npm run lint:fix
```

Dependencies
------------

We only use strict versions for all dependencies (`dependencies`,
`devDependencies`, etc.). We don't use range versions (`~x.y.z`, `^x.y.z`).

We're also being conservative here for stability reasons. But we're due to look
over new versions though.

Test
----

Check that your code passes the tests before submitting a PR:

    $ npm test

