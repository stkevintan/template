/**
 * Created by kevin on 16-4-12.
 */
'use strict'
const app = require('express')();
const fs = require('fs');
const path = require('path');
app.get('/all', (req, res, next)=> {
  const dir = path.resolve(__dirname, './dist')
  const files = fs.readdirSync(dir);
  let result = '<ul>';
  files.forEach((file)=>{
      if (!!!fs.lstatSync(path.join(dir, file)).isDirectory() && file.indexOf('.html') !== -1) {
          result += '<li style="display: block">';
          result +=     '<a href="' + file + '" style="display: inline; font-size: 400%">' + file + '</a>';
          result += '</li>';
      }
  });
  result += '</ul>';
  res.send(result);
});
module.exports = app;
