import { createHttpServer } from './server';

const port = process.env.PORT || 5050;

createHttpServer().listen(port, () => {
  console.log('Server is running');
});
