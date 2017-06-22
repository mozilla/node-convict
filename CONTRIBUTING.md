CONTRIBUTING
============

We strive for stability and security.

Pull Requests and contributions in general are welcome as long as they don't
compromise those goals and follow the
[Node aesthetic](http://substack.net/node_aesthetic).


Code style
----------

Coding style is described through the EditorConfig
[.editorconfig](./.editorconfig) file and enforced by ESLint through the
[.eslintrc](./.eslintrc) file.

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

    npm test


Creating/Tagging new versions
-----------------------------

This section is intended for all the maintainers of the project.

Tagging a new version *should not be done manually*,
but through the `npm version` command, as the example shows below.

This must be done so in order to:

* never forget to create a Git tag
* never create wrong tags and versions
* never forget to add a corresponding entry in the [CHANGELOG](./CHANGELOG.md)
  file

Example on how to create/tag new versions:

```bash
npm version patch

npm version minor

npm version major
```
