import { createHttpServer } from './server';

const [preferredPort = 5050] = process.argv.slice(2);

const port = process.env.PORT || preferredPort;

createHttpServer().listen(port, () => {
  console.log('Server is running on port: ', port);
});
