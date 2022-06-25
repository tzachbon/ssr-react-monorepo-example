import express, { Express } from 'express';
import compression from 'compression';
import { createRestAPI } from './api/index.js';
import { createScripts } from './scripts.js';
import { createAppRenderer } from './render.js';
import { appRootPath } from './consts.js';

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

  return createAppRenderer(app);
}
