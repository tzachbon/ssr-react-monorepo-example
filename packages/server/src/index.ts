import { createHttpServer } from './server';
import { safeListeningHttpServer } from 'create-listening-server';

const [preferredPort = 5050] = process.argv.slice(2);

const port = Number(process.env.PORT || preferredPort);

const app = createHttpServer();
safeListeningHttpServer(port, app)
  .then(({ port }) => process.send!({ port }))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
