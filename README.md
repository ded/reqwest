It's AJAX
---------
All over again.

The happs
---------

    $ git clone git://github.com/ded/reqwest.git
    $ cd reqwest
    $ npm install --dev
    $ npm run-script boosh

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
  error: function (err) { }
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
---------
    npm test
    open http://localhost:1234

Browser support
---------------
  * IE6+
  * Chrome 1+
  * Safari 3+
  * Firefox 1+
  * Opera

Ender Support
-------------
Reqwest can be used as an [Ender](http://ender.no.de) module. Add it to your existing build as such:

    $ ender add reqwest

Use it as such:

``` js
$.ajax({ ... });
$(form).serialize();
```

**Happy Ajaxing!**
