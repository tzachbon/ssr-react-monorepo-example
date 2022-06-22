import { Express, Router } from 'express';
import { createUserRoutes } from './user';

export function createRestAPI(app: Express) {
  const router = Router();

  createUserRoutes(router);

  app.use('/api/v1/', router);
}
