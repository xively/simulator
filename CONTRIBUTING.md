# Contributing to Xively Simulator

This document contains everything you need to contribute to this project.
Here are the guidelines we'd like you to follow:
- [Project structure](#project-structure)
- [Coding rules](#coding-rules)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Commit Message Format](#commit-message-format)

## Project structure

- `client`: front-end code written in [Angular](https://angularjs.org/)
- `config`: configurations for the server, client, provisioning and custom devices
- `provision`: provisioning related code
- `scripts`: utility files
- `server`: written in [Node.js](https://nodejs.org/en/)

## Coding rules

To ensure consistency throughout the source code, keep these rules in mind as you are working.
For the entire project follow the [JavaScript Standard Style](http://standardjs.com/).

### Client code ([Angular](https://angularjs.org/))

- single responsibility: define one component per a file
- use the [`controllerAs`](https://docs.angularjs.org/api/ng/directive/ngController) syntax over the `classic controller with $scope` syntax
- use a `factory` if you are creating a service
- create an `index.js` for every module that exports the name of it
- use [ES6](https://babeljs.io/docs/learn-es2015/)
- annotate the functions with `/* @ngInject */` comment where dependency injection is used
- include the template code inline the JavaScript file for components, directives and states
- structure the files by feature instead of behaviour (eg. `devices` instead of `services, controllers, ...`)
- use the following file extensions:
  - module: `*.module.js`
  - controller: `*.controller.js`
  - directive: `*.directive.js`
  - component: `*.component.js`
  - factory, service, provider: `*.service.js`
  - config: `*.config.js`
  - run: `*.run.js`
  - constant: `*.constant.js`
  - route, state: `*.route.js`
  - interceptor: `*.interceptor.js`
  - test: `*.spec.js`
- use the following patterns for defining components:
  - module: prefix with `simulator.`
  - controller, directive, component, factory: camelCase
  - constant: UPPERCASE
  - route, state: kebab-case

### Server and Provision code ([Node.js](https://nodejs.org/en/))

- always try to use existing [npm](npmjs.com) packages before implementing something by yourself
- use exact versions for [dependencies](https://docs.npmjs.com/files/package.json#dependencies) in `package.json`
- use [ES6](https://babeljs.io/docs/learn-es2015/)
- don't use the `var` keyword, use `const` and `let` instead
- write tests
- keep the modular pattern of the project

## Submitting a Pull Request

Before you submit your pull request consider the following guidelines:

- make your changes in a new git branch:
  ```shell
   git checkout -b my-branch staging
  ```

- create your patch. Include test cases.

- commit your changes using a descriptive commit message that follows our [commit message conventions](#commit-message-format).

- push your branch to GitHub:
  ```shell
  git push origin my-branch
  ```

- in GitHub, send a pull request to `concaria:staging`.

- if we suggest changes then:
  - make the required updates.
  - commit your changes to your branch (e.g. `my-branch`).
  - push the changes to your GitHub repository (this will update your Pull Request).

If the PR gets too outdated we may ask you to rebase, squash and force push to update the PR:
  ```shell
  git rebase staging -i
  git push origin my-branch -f
  ```

## Commit Message Format

The commit message has a special format that includes a type, a scope and a subject:
```
<type>(<scope>): <subject>
```

### Type

Must be one of the following:

- feat: a new feature
- fix: a bug fix
- docs: documentation only changes
- style: changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: a code change that neither fixes a bug nor adds a feature
- perf: a code change that improves performance
- test: adding missing tests
- chore: changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope

The scope could be anything specifying place of the commit change.

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end
