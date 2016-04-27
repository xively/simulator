# Contributing to Xively Simulator

This document contains everything you need to contribute to this project.
Here are the guidelines we'd like you to follow:
- [Project structure](#project-structure)
- [Coding rules](#coding-rules)
- [The rebase team policy](#the-rebase-team-policy)
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

## The rebase team policy
 
> When a feature branch’s development is complete, rebase/squash all the work down to the minimum number of meaningful commits and avoid creating a merge commit – either making sure the changes fast-forward (or simply cherry-pick those commits into the target branch).
> While the work is still in progress and a feature branch needs to be brought up to date with the upstream target branch, use rebase – as opposed to pull or merge – not to pollute the history with spurious merges.

## Submitting a Pull Request

Before you submit your pull request consider the following guidelines:

- make your changes in a new git branch:
  ```shell
   git checkout -b my-branch development
  ```

- create your patch, include test cases

- commit your changes using a descriptive commit message that follows our [commit message conventions](#commit-message-format)

- push your branch to GitHub:
  ```shell
  git push origin my-branch
  ```

- in GitHub, send a pull request to `concaria:development`.

- if we suggest changes then:
  - make the required updates
  - commit your changes to your branch (e.g. `my-branch`)
  - push the changes to your GitHub repository (this will update your Pull Request)

If the PR gets too outdated we may ask you to rebase, squash and force push to update the PR:

- using CLI:
  ```shell
  git rebase development -i
  git push origin my-branch -f
  ```
  
- using a git client, [SourceTree](https://www.sourcetreeapp.com/):

  - The first step is to rebase on the current `development` branch: right click on `development` then select `Rebase`. If you face conflicts you need to resolve them before the next step. If you finished resolving the conflicts, you can select `Actions/Continue` in the menubar (you can always abort the rebase with `Actions/Abort` and start again).
  ![rebase](https://www.dropbox.com/s/0fjxkiy7r45jcjq/rebase.png?dl=1)
  - If you have multiple commits or you need to change the commit message, you can use interactive rebase: Right click on the last commit of `development` then select `Rebase children of .... interactively`. Here you can:
    - squash commits by selecting the newest commit in the list and clicking on the `Squash with previous` button or using drag-and-drop
    - change the commit messages by selecting the commit and clicking on the `Edit message` button
    - click `OK` once you are done with your changes
  ![rebase-interactively](https://www.dropbox.com/s/jfwasz6jtg4rj9o/rebase-interactively.png?dl=1)
  - You need to force push your changes to your work branch (in this example `development-modal`), you might need to enable it in the Prefences under the General tab: `Allow force push`.
  ![force-push](https://www.dropbox.com/s/lds1anq6cjdrpqc/force-push.png?dl=1)
  
When we have reviewed your code it's ready to be pulled in. For this step we never use the `Merge` button on Github, because it would create a merge commit. We checkout your branch locally and push it to the `development` branch. It will automatically close your Pull Request as well.   

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
