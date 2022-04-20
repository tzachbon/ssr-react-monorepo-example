# Example for React Server-Side Rendering (SSR) without any framework inside monorepo with Typescript

This repo is trying to demonstrate how to implement server side rendering with React in a simple monorepo (npm v8 workspaces) without any frameworks.

> It's still a WIP.


## Installation

> Make use you use npm version 8 or above.

```bash
npm install
```

```bash
npm run build:all
```

## Development, building and testing

We look for a seamless development that will react according to your changes, here's the command that you should run at the **root of the project**

### Testing

In order to test the monorepo you have 2 options:
* Run the tests with `npm test` which will use `mocha` as the test runner and run the suites in parallel. Make sure to create the tests inside the `test` folder (in each package) and under the suffix `.test.ts`.
* If you use VSCode, you can use the build-in debugger. Go to the file that you want to debug and press F5. It should run only the specific file.


### Development and building 

#### App

Main client application (React).

* `dev` - Run watcher for typescript files and initialize Webpack dev server for the client code.

```bash
npm run dev:app
```

* `build` - Build the types and the client bundle.

```bash
npm run build:app
```

#### Server

The server application (express).

* `dev` - Run watcher for typescript files and the client bundle.

```bash
npm run dev:server
```

* `build` - Build the types and the client bundle.

```bash
npm run build:server
```
