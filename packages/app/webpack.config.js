// @ts-check

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rootWebpackConfig = require('../../webpack.config');
const packageJSON = require('./package.json');

/** @type import('webpack').Configuration */
module.exports = {
  ...rootWebpackConfig,
  entry: {
    client: require.resolve('./src/client.tsx'),
    index: require.resolve('./src/index.tsx'),
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
      template: require.resolve('./src/html.ejs'),
      hash: true,
      excludeChunks: ['index'],
      templateParameters: {
        dependencies: {
          ...packageJSON.dependencies,
        },
      },
    }),
  ],
};
