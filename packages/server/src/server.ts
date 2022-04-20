import express, { Express } from 'express';
import path from 'path';
import compression from 'compression';
import { render } from './render';

const appRoot = path.dirname(require.resolve('app'));

export function createHttpServer() {
  const app = express();

  app.use(compression());

  expose(app);

  return renderApp(app);
}

function expose(app: Express) {
  app.use(express.static(appRoot, { index: false })); // Expose the App content to resolve its requests
  app.use('/react', express.static(path.dirname(require.resolve('react/package.json')))); // Expose react package
  app.use('/react-dom', express.static(path.dirname(require.resolve('react-dom/package.json')))); // Expose react-dom package

  return app;
}

function renderApp(app: Express) {
  /**
   * Expose the rendered App from any path that is not resolved (as SPA application).
   */
  app.get('*', (req, res) => render(appRoot, req, res));

  return app;
}
