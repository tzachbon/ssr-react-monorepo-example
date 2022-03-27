# App

This is a simple todo app.
This app can be a standalone client only application or served from the server.

### Client only

In order to use it as client only, you will just need to serve the `index.html` file from the `dist/umd` directory that is created after running `npm run build`.

You can use the `npm start` to run this app with the webpack dev server.

### Server Side Rendering.

This app is bundled as umd, therefore uses the "globalThis" so it can be used in node.js applications.
You can require the `App` component from the `app` package and serve it with `ReactDOMServer.renderToString`.

You can see the example [here](../../packages/server/README.md)

## Dev 

**From the root of the project**

`npm run start:app`