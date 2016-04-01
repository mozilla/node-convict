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

Finally we maintain an exact dependency version tree through
[npm-shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap).
So when updating dependencies in the `package.json`, you have to run the
following command:

```bash
npm run safefreeze
```

Tip: If the `package.json` file has been modified in other areas than the
dependencies, it's irrelevant to regenerate a new `npm-shrinkwrap.json` file. So
to avoid our `assert_release_quality` script to complain in this situation you
can run the following command:

```bash
touch npm-shrinkwrap.json
```


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
* never forget to add a corresponding entry in the [ChangeLog](./ChangeLog)
  file

Example on how to create/tag new versions:

```bash
npm version patch

npm version minor

npm version major
```
