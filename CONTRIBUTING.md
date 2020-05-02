CONTRIBUTING
============

We strive for stability and security.

Pull Requests and contributions in general are welcome as long as they don't
compromise those goals and follow the
[Node aesthetic](https://github.com/substack/blog/blob/master/node_aesthetic.markdown).


Project structure and management
--------------------------------

This repository is a monorepo for multiple packages managed through
[Lerna](https://lerna.js.org/).

Use the following commands to manage this repository and its packages.

To install all the dependencies, devDependencies and links any cross-dependencies:

```shellsession
npx lerna bootstrap
```


Code style
----------

Coding style is described through the EditorConfig
[.editorconfig](./.editorconfig) file and enforced by ESLint through the
[.eslintrc](./.eslintrc.js) file.

Running the following command line will help you to conform your newly written
code:

```shellsession
npm run lint:fix
```


Test
----

Before submitting a PR, check that the code, with your modifications, still
passes the tests:

```shellsession
npm test
```


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

```shellsession
npm version patch

npm version minor

npm version major
```

