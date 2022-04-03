import express from 'express';
import { safeListeningHttpServer } from 'create-listening-server';

const [outputPath, preferredPort] = process.argv.slice(2);
const port = Number(preferredPort || 8080);

const app = express();

app.use(
  express.static(outputPath!, {
    cacheControl: false,
    etag: false,
    immutable: false,
    lastModified: false,
  })
);

safeListeningHttpServer(port, app)
  .then(({ port }) => process.send!({ port }))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
