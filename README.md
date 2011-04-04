[*visitors*]: we are not currently taking support requests until we finalize a basic design
Reqwest
-------
It's HTML5 compliant ;)

The happs
---------

    git clone git://github.com/ded/Reqwest.git
    cd !$
    git submodule update --init
    make

The codes
---------

    reqwest('path/to/html', function (resp) {
      Q('#content').html(resp);
    });

    reqwest({
      url: 'path/to/json',
      type: 'json',
      method: 'post',
      success: function (resp) {
        Q('#content').html(resp.content);
      },
      failure: function (err) { }
    });

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