const webpack = require('webpack');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DEST = path.join(__dirname, 'dist');

module.exports = {
  target: 'web',
  cache: false,
  devtool: 'source-map',
  entry: [ SRC ],
  output: {
    path: DEST,
    filename: 'rsaaes.js',
    library: 'rsaaes',
    libraryTarget: 'commonjs2',
    sourceMapFilename: 'rsaaes.js.map'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        // When translating we do not want anything cached
        use: 'babel-loader',
        include: [ SRC ]
      },
      {
        test: /\.jsx?$/,
        use: 'eslint-loader',
        include: [ SRC ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
  ]
};

