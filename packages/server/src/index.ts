import { createHttpServer } from './server.js';
import { createListeningHttpServer } from 'create-listening-server';

const [preferredPort = 5050] = process.argv.slice(2);

const port = Number(process.env.PORT || preferredPort);

const app = createHttpServer();
createListeningHttpServer(port, app)
  .then(() => {
    process.send?.({ port });
    console.log(`Listening on port ${port}`);
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
