import express from 'express';

const [outputPath, port] = process.argv.slice(2);

const app = express();

app.use(
  express.static(outputPath!, {
    cacheControl: false,
    etag: false,
    immutable: false,
    lastModified: false,
  })
);
app.listen(port);
