It's AJAX
---------
All over again.

The happs
---------

    git clone git://github.com/ded/Reqwest.git
    cd !$
    git submodule update --init
    make

The codes
---------

``` js
reqwest('path/to/html', function (resp) {
  Q('#content').html(resp);
});
```

``` js
reqwest({
  url: 'path/to/json',
  type: 'json',
  method: 'post',
  success: function (resp) {
    Q('#content').html(resp.content);
  },
  failure: function (err) { }
});
```

``` js
reqwest({
  url: 'path/to/data.jsonp?callback=?',
  type: 'jsonp',
  success: function (resp) {
    Q('#content').html(resp.content);
  }
});
```

``` js
reqwest({
  url: 'path/to/data.jsonp?foo=bar',
  type: 'jsonp',
  jsonpCallback: 'foo',
  success: function (resp) {
    Q('#content').html(resp.content);
  }
});
```

The Tests
-----
    make test
    open http://localhost:3000


Browser support
---------------
  * IE6+
  * Chrome 1+
  * Safari 3+
  * Firefox 1+
  * Opera

Build
-----
[Node.js](https://github.com/joyent/node/) is required to run tests and build + minify the Reqwest code.