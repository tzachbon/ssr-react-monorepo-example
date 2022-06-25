import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const htmlPath = require.resolve('app/html');
export const appRootPath = path.dirname(htmlPath);
