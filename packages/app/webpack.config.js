// @ts-check

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import rootWebpackConfig from '../../webpack.config.js';
import packageJSON from './package.json' assert { type: 'json' };
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);

/** @type {import('webpack').Configuration['mode']} */
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';

/** @type {import('webpack').Configuration} */
export default {
  ...rootWebpackConfig,
  mode,
  entry: {
    client: require.resolve('./dist/app/client.js'),
    index: require.resolve('./dist/app/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    globalObject: 'globalThis',
  },
  externals: [
    {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    ...(rootWebpackConfig.plugins ?? []),
    new HtmlWebpackPlugin({
      cache: mode === 'production',
      template: require.resolve('./src/html.ejs'),
      hash: true,
      excludeChunks: ['index'],
      minify: {
        removeComments: false,
      },
      templateParameters: {
        dependencies: {
          ...packageJSON.dependencies,
        },
        reactEnvMode: mode === 'development' ? 'development' : 'production.min',
      },
    }),
  ],
};
