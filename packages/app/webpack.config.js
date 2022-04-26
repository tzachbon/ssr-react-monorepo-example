// @ts-check

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rootWebpackConfig = require('../../webpack.config');
const packageJSON = require('./package.json');

/** @type {(webpack: import('webpack').Configuration) => import('webpack').Configuration} */
module.exports = (w) => ({
  ...rootWebpackConfig,
  entry: {
    client: require.resolve('./dist/src/client.js'),
    index: require.resolve('./dist/src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist/umd'),
    libraryTarget: 'umd',
    globalObject: 'globalThis',
  },
  externals: {
    react: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React',
    },
    'react-dom': {
      amd: 'react-dom',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      root: 'ReactDOM',
    },
  },
  plugins: [
    ...(rootWebpackConfig.plugins ?? []),
    new HtmlWebpackPlugin({
      cache: w.mode === 'production',
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
      },
    }),
  ],
});
