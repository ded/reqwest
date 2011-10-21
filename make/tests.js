var http = require('http')
  , exec = require('child_process').exec
  , fs = require('fs')
  , Connect = require('connect')
  , dispatch = require('dispatch')
  , mime = require('mime')
  , getMime = function(ext) {
      return mime.lookup(ext == 'jsonp' ? 'js' : ext)
    }

var routes = {
  '/': function (req, res) {
    res.write(fs.readFileSync('./tests/tests.html', 'utf8'))
    res.end()
  },

  '(([\\w\\-\\/]+)\\.(css|js|json|jsonp|html)$)': function (req, res, m, file, ext) {
    res.writeHead(200, {
      'Expires': 0
      , 'Cache-Control': 'max-age=0, no-cache, no-store'
      , 'Content-Type': getMime(ext)
    })
    if (req.query.echo !== undefined) {
      ext == 'jsonp' && res.write((req.query.callback || 'echoCallback') + '(')
      res.write(JSON.stringify(req.query))
      ext == 'jsonp' && res.write(');')
    } else {
      res.write(fs.readFileSync('./' + file + '.' + ext))
    }
    res.end()
  }
}

Connect.createServer(Connect.query(), dispatch(routes)).listen(1234)

exec('open http://localhost:1234', function () {
  console.log('opening tests at http://localhost:1234')
})
