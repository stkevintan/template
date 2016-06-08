/* eslint-env node */
const webpack = require('webpack');
// const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
module.exports = {
  entry: {
    app: ['./src/scripts/entry.js'],
  },
  output: {
    path: `${__dirname}/dist/assets/js`,
    filename: 'bundle.js',
    publicPath: '/assets/js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: false,
          presets: ['es2015', 'stage-1'],
          // plugins: [
          //   'transform-decorators-legacy',
          //   'transform-class-properties',
          // ],
        },
      },
    // load icon-font
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream',
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file' },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml',
      },
          // {test: /bootstrap-sass\/assets\/javascripts\//, loader: 'imports?jQuery=jquery' }
      { test: /\.(css|sass|scss)$/, loader: 'style!css!sass' },
      {
        test: /\.(png|jvendorpg)$/,
        loader: 'url-loader?limit=10000&name=[name].[ext]',
      },
          //{test:/\.jade$/,loader:"jade"}
    ],
  },
  resolve: {
    root: [
    //  path.resolve('./src/components/'),
    ],
    alias: {
    //  Actions: path.resolve('./src/actions/'),
    },
  },
  plugins: [
    new webpack.BannerPlugin(`This file is created by Kevin Tan
      ${(new Date()).toLocaleDateString()}`),
    new CleanWebpackPlugin(['dist/assets/js', 'release/assets/js'], {
      verbose: true,
      dry: false,
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   filename: 'vendor.bundle.js',
    //   minChunks: 3,
    // }, 'vendor.bundle.js'),
    new webpack.NoErrorsPlugin(),
      // new HtmlWebpackPlugin({
      //     title: 'clanguage'
      // }),
      // new CopyWebpackPlugin([
      //     {from: 'src/index.html', to: '../index.html', force: true}
      // ])
  ],
};
