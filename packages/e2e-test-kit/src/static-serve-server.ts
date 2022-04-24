import express from 'express';
import { createListeningHttpServer } from 'create-listening-server';

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

createListeningHttpServer(port, app)
  .then(() => {
    process.send?.({ port });
    console.log(`Listening on port ${port}`);
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
