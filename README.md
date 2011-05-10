It's AJAX
---------
All over again.

The happs
---------

    $ git clone git://github.com/ded/reqwest.git
    $ cd reqwest
    $ git submodule update --init
    $ make
    $ make install

API
---------

``` js
reqwest('path/to/html', function (resp) {
  qwery('#content').html(resp);
});
```

``` js
reqwest({
  url: 'path/to/json',
  type: 'json',
  method: 'post',
  success: function (resp) {
    qwery('#content').html(resp.content);
  },
  failure: function (err) { }
});
```

``` js
reqwest({
  url: 'path/to/data.jsonp?callback=?',
  type: 'jsonp',
  success: function (resp) {
    qwery('#content').html(resp.content);
  }
});
```

``` js
reqwest({
  url: 'path/to/data.jsonp?foo=bar',
  type: 'jsonp',
  jsonpCallback: 'foo',
  success: function (resp) {
    qwery('#content').html(resp.content);
  }
});
```

The Tests
-----
    make test
    open http://localhost:1234

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