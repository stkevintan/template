const app = require('express')();
const path = require('path');

// webpack server config
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const wc = require('../webpack.config');

// api for test
const api = require('./api');

// file explorer
const fe = require('./fileExplorer');


module.exports = (opts) => {
  const baseDir = path.resolve(opts.dest);
  wc.output.path = path.join(baseDir, '/assets/js');
  wc.entry.app.unshift('webpack-hot-middleware/client?reload=true');
  wc.plugins.push(new webpack.HotModuleReplacementPlugin());
  for (const key of Object.keys(wc.entry)) {
    let val = wc.entry[key];
    if (!Array.isArray(val))val = Array.from(val);
    val.unshift('webpack-hot-middleware/client?reload=true');
  }
  wc.devtool = 'cheap-module-source-map';
  const compiler = webpack(wc);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    contentBase: baseDir,
    publicPath: wc.output.publicPath,
  }));
  app.use(webpackHotMiddleware(compiler));
  // add router
  app.use('/map', fe(baseDir));
  app.use('/', api(baseDir));
  return app;
};
