# Example for React Server-Side Rendering (SSR) without any framework inside monorepo with Typescript

This repo is trying to demonstrate how to implement server side rendering with React in a simple monorepo (npm v8 workspaces) without any frameworks.

> It's still a WIP.

## Stack

* Package Manager: [npm](https://www.npmjs.com/)
* Worksapce Manager: [npm (v8)](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
* Script runner: [Turborepo](https://turborepo.org/)
* Language: [Typescript](https://www.typescriptlang.org/) (Output to [`esm`](https://nodejs.org/api/esm.html))
* Bundler: [Webpack](https://webpack.js.org/)
* Test Runner: [Mocha](https://mochajs.org/)
* Assertion Library: [Expect](https://www.npmjs.com/package/expect)
* Web testing and Automation: [Playwright](https://playwright.dev/)
* Linter: [ESLint](https://eslint.org/)
* CI: [Github Actions](https://github.com/features/actions)


## Installation

> Make use you use npm version 8 or above.

```bash
npm install
```

> We look for a seamless development that will react according to your changes, here's the command that you should run at the **root of the project**


## Build

```bash
npm run build
```

## Development

```bash
npm run dev
```


### Testing

In order to test the monorepo you have 2 options:
* Run the tests with `npm test` which will use `mocha` as the test runner and run the suites in parallel. Make sure to create the tests inside the `test` folder (in each package) and under the suffix `.test.ts`.
* If you use VSCode, you can use the build-in debugger. Go to the file that you want to debug and press F5. It should run only the specific file.


### Development and building 

#### App

Main client application (React).

* `dev` - Run watcher for typescript files and initialize Webpack dev server for the client code.
* `build` - Build the types and the client bundle.


#### Server

The server application (express).

* `dev` - Run watcher for typescript files and the client bundle.
* `build` - Build the types and the client bundle.
