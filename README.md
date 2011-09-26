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
    url: 'path/to/html'
  , method: 'post'
  , data: { foo: 'bar', baz: 100 }
  , success: function (resp) {
      qwery('#content').html(resp)
    }
})
```

``` js
reqwest({
    url: 'path/to/html'
  , method: 'get'
  , data: { [ name: 'foo', value: 'bar' ], [ name: 'baz', value: 100 ] }
  , success: function (resp) {
      qwery('#content').html(resp)
    }
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
```

Serialize things:

``` js
$(form).serialize() // returns query string -> x=y&...
$(form).serialize({type:'array'}) // returns array name/value pairs -> [ { name: x, value: y}, ... ]
$(form).serialize({type:'map'}) // returns an object representation -> { x: y, ... }
$(form).serializeArray()
```

Or, get a bit fancy:

``` js
$('#myform input[name=myradios]').serialize({type:'map'})['myradios'] // get the selected value
$('input[type=text],#specialthing').serialize() // turn any arbitrary set of form elements into a query string
```

**Happy Ajaxing!**
