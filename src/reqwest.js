/*!
  * Boom. Ajax! Ever heard of it!?
  * copyright 2011 @dedfat
  * https://github.com/ded/reqwest
  * license MIT
  */
!function (context) {
  var twoHundo = /20\d/;

  var reqwest = function() {
    function readyState (o, fn) {
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

    var xhr = ('XMLHttpRequest' in window) ?
      function() {
        return new XMLHttpRequest;
      } :
      function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      };

    return function (o, callback) {
      var http = xhr();
      http.open(o.method || 'GET', typeof o == 'string' ? o : o.url, true);
      http.onreadystatechange = readyState(http, callback || o);
      http.send(o.data || null);
      return http;
    };
  }();

  var oldJax = context.reqwest;
  reqwest.noConflict = function () {
    context.reqwest = oldJax;
    return this;
  };
  context.reqwest = reqwest;

}(this);