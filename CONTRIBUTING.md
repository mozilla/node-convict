CONTRIBUTING
============

We strive for simplicity, stability and security.

Pull Requests and all contributions in general are welcome as long as they don't
compromise those goals.


Project structure and management
--------------------------------

This repository is a monorepo for multiple packages.

This repository is managed through
[workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces/)
(workspace packages) and [Lerna-Lite](https://github.com/ghiscoding/lerna-lite).


Running tests
-------------

```shellsession
cd node-convict
npm ci
npm test
```


Code style
----------

Coding style is described through the EditorConfig
[.editorconfig](./.editorconfig) file and enforced by ESLint through the
[.eslintrc](./.eslintrc.js) file.

Running the following command line will help you to conform your newly written
code:

```shellsession
cd node-convict
npm ci
npm run lint:fix
```


Updating dependencies and devDependencies
-----------------------------------------

1. If you need, modify the versions of the `dependencies` by editing the
   `packages/*/package.json` files.

2. If you need, modify the versions the `devDependencies` in the root-level
   `package.json` file.

3. Generate an updated `package-lock.json` file.

    ```shellsession
    cd node-convict
    npm install
    ```
4. Commit the file changes and create a new Pull Request.


Creating/Tagging and publishing new versions
--------------------------------------------

This section is intended for the maintainers of the project.

Those actions can only be performed by a Mozilla employee or a trusted
contributor with enough accesses.

**Everything, updating the `CHANGELOG.md` files, tagging and publishing should
be done through Lerna-Lite**.

*Lerna-Lite* provides the `lerna` command.

### Tagging a new version

Tagging should not be done manually, nor through the `npm version` command.
Tagging should be done through the `lerna` command like this:

```shellsession
cd node-convict
npm ci
npx lerna version
```

### Publishing a new version

Publishing should not be done through the `npm publish` command.
Publishing should be done through the `lerna` command like this:

```shellsession
cd node-convict
npm ci
npm login
npx lerna publish from-package
npm logout
```
