var http = require('http'),
    exec = require('child_process').exec,
    fs = require('fs'),
    Connect = require('../build/connect/'),
    dispatch = require('../build/dispatch/'),
    mime = require('../build/mime/');

var routes = {
  '/': function (req, res) {
    res.write(fs.readFileSync('./tests/tests.html', 'utf8'));
    res.end();
  },

  '(([a-zA-Z0-9_\\-\\/]+)\\.(css|js|json|html)$)': function (req, res, m, whole, file, ext) {
    res.writeHead(200, {'Content-Type': mime.lookup(ext)});
    var asset = fs.readFileSync('./' + file + '.' + ext);
    res.write(asset);
    res.end();
  }
};

Connect.createServer(dispatch(routes)).listen(1234, '127.0.0.1');

exec('open http://localhost:1234', function () {
  console.log('opening tests at http://localhost:1234');
});