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


Running tests
-------------

```shellsession
cd node-convict
npm run setup
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
npm run lint:fix
npm run setup
```


Updating dependencies and devDependencies
-----------------------------------------

1. Update the version of the `dependencies` in the packages `package.json` files
   and the `devDependencies` in the root-level `package.json`

2. Fetch the packages and update the `package-lock.json`

```shellsession
cd node-convict
npm install
npm install packages/*
npx lerna link
```

Never run `lerna bootstrap`, cf. https://github.com/lerna/lerna/issues/1462#issuecomment-410536290


Creating/Tagging and publishing new versions
--------------------------------------------

This section is especially intended for the maintainers of the project.

Before any new release the [CHANGELOG](./CHANGELOG.md) must be updated.

**Everything tagging and publishing should be done throug Lerna**.

Tagging should not be done manually, nor through the `npm version` command.

```shellsession
npx lerna version 6.0.0
npx lerna publish from-git
```
