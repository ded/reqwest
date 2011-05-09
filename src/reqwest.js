!function (context) {
  var twoHundo = /^20\d$/,
      xhr = ('XMLHttpRequest' in window) ?
        function () {
          return new XMLHttpRequest();
        } :
        function () {
          return new ActiveXObject('Microsoft.XMLHTTP');
        };
        
  var uniqid = (function () {
    var id = 0;
    return {
      get: function () {
        return id++;
      }
    };
  }());

  function readyState(o, success, error) {
    return function () {
      if (o && o.readyState == 4) {
        if (twoHundo.test(o.status)) {
          success(o);
        } else {
          error(o);
        }
      }
    };
  }

  function setHeaders(http, options) {
    var headers = options.headers || {};
    headers.Accept = 'text/javascript, text/html, application/xml, text/xml, */*';
    if (options.data) {
      headers['Content-type'] = 'application/x-www-form-urlencoded';
      for (var h in headers) {
        headers.hasOwnProperty(h) && http.setRequestHeader(h, headers[h], false);
      }
    }
  }
  
  function getCallbackName(o) {
    var callbackVar = o.jsonpCallback || "callback";
    if (o.url.substr(-10) == (callbackVar + "=?")) {
      // Generate a guaranteed unique callback name
      var callbackName = "Request" + uniqid.get();
      
      // Replace the ? in the URL with the generated name
      o.url = o.url.substr(0, o.url.length - 1) + callbackName;
      return callbackName;
    } else {
      // Find the supplied callback name
      var regex = new RegExp(callbackVar + "=([A-Za-z0-9_]+)");
      return o.url.match(regex)[1];
    }
  }

  function getRequest(o, fn, err) {
    if (o.type == 'jsonp') {
      var script = document.createElement('script');
      var head = document.getElementsByTagName('head')[0];
      
      // Add the global callback
      var callbackName = getCallbackName(o);
      window[callbackName] = function (data) {
        // Call the success callback
        o.success && o.success(data);
      };
      
      // Setup our script element
      script.type = "text/javascript";
      script.src = o.url;
      script.onload = function () {
        // Script has been loaded, and thus the user callback has
        // been called, so lets clean up now.
        head.removeChild(script);
        delete window[callbackName];
      };
      
      // Add the script to the DOM head
      head.appendChild(script);
    } else {
      var http = xhr();
      http.open(o.method || 'GET', typeof o == 'string' ? o : o.url, true);
      setHeaders(http, o);
      http.onreadystatechange = readyState(http, fn, err);
      o.before && o.before(http);
      http.send(o.data || null);
      return http;
    }
  }

  function Reqwest(o, fn) {
    this.o = o;
    this.fn = fn;
    init.apply(this, arguments);
  }

  function setType(url) {
    if (/\.json$/.test(url)) {
      return 'json';
    }
    if (/\.jsonp$/.test(url)) {
      return 'jsonp';
    }
    if (/\.js$/.test(url)) {
      return 'js';
    }
    if (/\.html?$/.test(url)) {
      return 'html';
    }
    if (/\.xml$/.test(url)) {
      return 'xml';
    }
    return 'js';
  }

  function init(o, fn) {
    this.url = typeof o == 'string' ? o : o.url;
    this.timeout = null;
    var type = o.type || setType(this.url), self = this;
    fn = fn || function () {};

    if (o.timeout) {
      this.timeout = setTimeout(function () {
        self.abort();
        error();
      }, o.timeout);
    }

    function complete(resp) {
      o.complete && o.complete(resp);
    }

    function success(resp) {
      o.timeout && clearTimeout(self.timeout) && (self.timeout = null);
      var r = resp.responseText;

      switch (type) {
      case 'json':
        resp = eval('(' + r + ')');
        break;
      case 'js':
        resp = eval(r);
        break;
      case 'html':
        resp = r;
        break;
      // default is the response from server
      }

      fn(resp);
      o.success && o.success(resp);
      complete(resp);
    }

    function error(resp) {
      o.error && o.error(resp);
      complete(resp);
    }

    this.request = getRequest(o, success, error);
  }

  Reqwest.prototype = {
    abort: function () {
      this.request.abort();
    },

    retry: function () {
      init.call(this, this.o, this.fn);
    }
  };

  function reqwest(o, fn) {
    return new Reqwest(o, fn);
  }

  var old = context.reqwest;
  reqwest.noConflict = function () {
    context.reqwest = old;
    return this;
  };
  context.reqwest = reqwest;

}(this);