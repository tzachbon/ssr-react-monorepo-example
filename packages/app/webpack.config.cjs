// @ts-check

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rootWebpackConfig = require('../../webpack.config.cjs');
const packageJSON = require('./package.json');

const mode = process.env.NODE_ENV || 'development';

/** @type {import('webpack').Configuration} */
module.exports = {
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
