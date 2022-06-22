import express, { Express } from 'express';
import compression from 'compression';
import { createRestAPI } from './api';
import { createScripts } from './scripts';
import { createAppRenderer } from './render';
import { appRootPath } from './consts';

export function createHttpServer() {
  const app = express();

  app.use(compression());

  expose(app);

  return app;
}

function expose(app: Express) {
  app.use(express.static(appRootPath, { index: false })); // Expose the App content to resolve its requests

  createScripts(app);
  createRestAPI(app);
  createAppRenderer(app);
}
