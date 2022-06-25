import { Express, Router } from 'express';
import { createUserRoutes } from './user.js';

export function createRestAPI(app: Express) {
  const router = Router();

  createUserRoutes(router);

  app.use('/api/v1/', router);
}
