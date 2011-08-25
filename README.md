# It's AJAX

All over again.

The happs
---------

    $ git clone git://github.com/ded/reqwest.git reqwest
    $ cd !$
    $ npm install --dev
    $ make

API
---------

``` js
reqwest('path/to/html', function (resp) {
  qwery('#content').html(resp)
})
```

``` js
reqwest({
    url: 'path/to/json'
  , type: 'json'
  , method: 'post'
  , error: function (err) { }
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

``` js
reqwest({
    url: 'path/to/data.jsonp?callback=?'
  , type: 'jsonp',
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

``` js
reqwest({
    url: 'path/to/data.jsonp?foo=bar'
  , type: 'jsonp'
  , jsonpCallback: 'foo'
  , success: function (resp) {
      qwery('#content').html(resp.content)
    }
})
```

The Tests
---------
    $ npm test

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
$.ajax({ ... })
$(form).serialize()
$(form).serializeArray()
```

**Happy Ajaxing!**
