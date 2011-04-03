/*!
  * Boom. Ajax! Ever heard of it!?
  * copyright 2011 @dedfat
  * https://github.com/ded/reqwest
  * license MIT
  */
!function (context) {
  var twoHundo = /^20\d$/,
      xhr = ('XMLHttpRequest' in window) ?
        function () {
          return new XMLHttpRequest();
        } :
        function () {
          return new ActiveXObject('Microsoft.XMLHTTP');
        };

  function readyState(o, fn) {
    return function () {
      if (o && o.readyState == 4) {
        if (twoHundo.test(o.status)) {
          fn && typeof fn == 'function' ? fn(o) : fn.success(o);
        } else {
          fn && fn.error && fn.error(o);
        }
        fn && fn.complete && fn.complete(o);
      }
    };
  }

  function getRequest(o, fn) {
    var http = xhr();
    http.open(o.method || 'GET', typeof o == 'string' ? o : o.url, true);
    http.onreadystatechange = readyState(http, fn || o);
    http.send(o.data || null);
    return http;
  }

  // would be cool if there was some fancy class system out there...
  function _reqwest(o, fn) {
    this.request = getRequest(o, fn);
    this.retries = o.retries || 0;
  }

  _reqwest.prototype = {
    abort: function () {
      this.request.abort();
    },

    retry: function () {
      this.request.send(this.o.data || null);
    }
  };

  function request(o, fn) {
    return new _reqwest(o, fn);
  }

  var oldJax = context.reqwest;
  reqwest.noConflict = function () {
    context.reqwest = oldJax;
    return this;
  };
  context.reqwest = reqwest;

}(this);