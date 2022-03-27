CONTRIBUTING
============

We strive for stability and security.

Pull Requests and contributions in general are welcome as long as they don't
compromise those goals and follow the
[Node aesthetic](https://github.com/substack/blog/blob/master/node_aesthetic.markdown).


Project structure and management
--------------------------------

This repository is a monorepo for multiple packages.

At the moment this repository is managed through [Lerna](https://lerna.js.org/)
with the following strategy below. This strategy is not perfect, as Lerna is not
(at least at time of writing) a tool perfectly fit for all npm current uses and
best practices cf. https://github.com/lerna/lerna/issues/1663,
https://github.com/lerna/lerna/issues/1462. And Lerna is missing best practices
for different use cases (at least at time of writing). So this strategy is
subject to change as we get more knowledge of Lerna and as new releases will be
done. Don't hesitate to propose better strategies, PR are welcomed!

### Strategy

* "Fixed/Locked" mode (Lerna default mode) for now
* All `devDependencies` in the root-level `package.json`. This is the sanest
  thing to do since all the packages are very very similar.
* Only one `package-lock.json` file at the root


Running tests
-------------

```shellsession
cd node-convict
npm ci
npm test
```

PS: `npm ci` will take care of all the needed Lerna setup through the
`postinstall` script.


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

PS: `npm ci` will take care of all the needed Lerna setup through the
`postinstall` script.


Updating dependencies and devDependencies
-----------------------------------------

1. Modify the versions of the `dependencies` by editing the
   `packages/*/package.json` files

2. Modify the versions the `devDependencies` in the
   root-level `package.json` file

3. Fetch the packages and update the `package-lock.json`

```shellsession
cd node-convict
npm install
npm install packages/*
```

PS: `npm ci` will take care of all the needed Lerna setup through the
`postinstall` script.
Never run `lerna bootstrap`,
cf. https://github.com/lerna/lerna/issues/1462#issuecomment-410536290


Creating/Tagging and publishing new versions
--------------------------------------------

This section is especially intended for the maintainers of the project.

Before any new release the [CHANGELOG](./CHANGELOG.md) must be updated.

**Everything tagging and publishing should be done throug Lerna**.

### Tagging a new version

Tagging should not be done manually, nor through the `npm version` command.
Tagging should be done through `lerna`.

```shellsession
cd node-convict
npm ci
npx lerna version 6.0.0
```

PS: `npm ci` will take care of all the needed Lerna setup through the
`postinstall` script.

### Publishing a new version

Publishing should not be done through the `npm publish` command.
Publishing should be done through `lerna`.

This action can only be performed by a Mozilla employee or a trusted contributor
with enough accesses.

```shellsession
cd node-convict
npm ci
npm login
npx lerna publish from-git
npm logout
```

PS: `npm ci` will take care of all the needed Lerna setup through the
`postinstall` script.
