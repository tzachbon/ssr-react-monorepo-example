import express, { Express } from 'express';
import path from 'path';

export function createScripts(app: Express) {
  app.use('/react', express.static(path.dirname(require.resolve('react/package.json')))); // Expose react package
  app.use('/react-dom', express.static(path.dirname(require.resolve('react-dom/package.json')))); // Expose react-dom package
}
