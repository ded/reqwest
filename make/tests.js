var http = require('http')
  , exec = require('child_process').exec
  , fs = require('fs')
  , Connect = require('connect')
  , dispatch = require('dispatch')
  , mime = require('mime')

var routes = {
  '/': function (req, res) {
    res.write(fs.readFileSync('./tests/tests.html', 'utf8'))
    res.end()
  },

  '(([a-zA-Z0-9_\\-\\/]+)\\.(css|js|json|html)$)': function (req, res, m, file, ext) {
    res.writeHead(200, {'Expires': 0, 'Cache-Control': 'max-age=0, no-cache, no-store', 'Content-Type': mime.lookup(ext)})
    res.write(fs.readFileSync('./' + file + '.' + ext))
    res.end()
  }
}

Connect.createServer(dispatch(routes)).listen(1234)

exec('open http://localhost:1234', function () {
  console.log('opening tests at http://localhost:1234')
})
