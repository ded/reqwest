
!function (name, definition) {
  if (typeof define == 'function') define(definition)
  else if (typeof module != 'undefined') module.exports = definition()
  else this[name] = definition()
}('reqwest', function () {

  var context = this
    , win = window
    , doc = document
    , old = context.reqwest
    , twoHundo = /^20\d$/
    , byTag = 'getElementsByTagName'
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , head = doc[byTag]('head')[0]
    , uniqid = 0
    , lastValue // data stored by the most recent JSONP callback
    , xhr = ('XMLHttpRequest' in win) ?
        function () {
          return new XMLHttpRequest()
        } :
        function () {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }

  function handleReadyState(o, success, error) {
    return function () {
      if (o && o[readyState] == 4) {
        if (twoHundo.test(o.status)) {
          success(o)
        } else {
          error(o)
        }
      }
    }
  }

  function setHeaders(http, o) {
    var headers = o.headers || {}
    headers.Accept = headers.Accept || 'text/javascript, text/html, application/xml, text/xml, */*'

    // breaks cross-origin requests with legacy browsers
    if (!o.crossOrigin) {
      headers['X-Requested-With'] = headers['X-Requested-With'] || 'XMLHttpRequest'
    }
    headers[contentType] = headers[contentType] || 'application/x-www-form-urlencoded'
    for (var h in headers) {
      headers.hasOwnProperty(h) && http.setRequestHeader(h, headers[h])
    }
  }

  function getCallbackName(o, reqId) {
    var callbackVar = o.jsonpCallback || "callback"
    if (o.url.slice(-(callbackVar.length + 2)) == (callbackVar + "=?")) {
      // Generate a guaranteed unique callback name
      var callbackName = "reqwest_" + reqId

      // Replace the ? in the URL with the generated name
      o.url = o.url.substr(0, o.url.length - 1) + callbackName
      return callbackName
    } else {
      // Find the supplied callback name
      var regex = new RegExp(callbackVar + "=([\\w]+)")
      return o.url.match(regex)[1]
    }
  }

  // Store the data returned by the most recent callback
  function generalCallback(data) {
    lastValue = data
  }

  function getRequest(o, fn, err) {
    if (o.type == 'jsonp') {
      var script = doc.createElement('script')
        , loaded = 0
        , reqId = uniqid++

      // Add the global callback
      win[getCallbackName(o, reqId)] = generalCallback

      // Setup our script element
      script.type = 'text/javascript'
      script.src = o.url
      script.async = true
      if (typeof script.onreadystatechange !== 'undefined') {
          // need this for IE due to out-of-order onreadystatechange(), binding script
          // execution to an event listener gives us control over when the script
          // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
          script.event = 'onclick'
          script.htmlFor = script.id = '_reqwest_' + reqId
      }

      script.onload = script.onreadystatechange = function () {
        if ((script[readyState] && script[readyState] !== "complete" && script[readyState] !== "loaded") || loaded) {
          return false
        }
        script.onload = script.onreadystatechange = null
        script.onclick && script.onclick()
        // Call the user callback with the last value stored
        // and clean up values and scripts.
        o.success && o.success(lastValue)
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }

      // Add the script to the DOM head
      head.appendChild(script)
    } else {
      var http = xhr()
      http.open(o.method || 'GET', typeof o == 'string' ? o : o.url, true)
      setHeaders(http, o)
      http.onreadystatechange = handleReadyState(http, fn, err)
      o.before && o.before(http)
      http.send(o.data || null)
      return http
    }
  }

  function Reqwest(o, fn) {
    this.o = o
    this.fn = fn
    init.apply(this, arguments)
  }

  function setType(url) {
    if (/\.json$/.test(url)) {
      return 'json'
    }
    if (/\.jsonp$/.test(url)) {
      return 'jsonp'
    }
    if (/\.js$/.test(url)) {
      return 'js'
    }
    if (/\.html?$/.test(url)) {
      return 'html'
    }
    if (/\.xml$/.test(url)) {
      return 'xml'
    }
    return 'js'
  }

  function init(o, fn) {
    this.url = typeof o == 'string' ? o : o.url
    this.timeout = null
    var type = o.type || setType(this.url)
      , self = this
    fn = fn || function () {}

    if (o.timeout) {
      this.timeout = setTimeout(function () {
        self.abort()
      }, o.timeout)
    }

    function complete(resp) {
      o.timeout && clearTimeout(self.timeout)
      self.timeout = null
      o.complete && o.complete(resp)
    }

    function success(resp) {
      var r = resp.responseText
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')          
          } catch(err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break;
        case 'js':
          resp = eval(r)
          break;
        case 'html':
          resp = r
          break;
        }
      }

      fn(resp)
      o.success && o.success(resp)

      complete(resp)
    }

    function error(resp, msg, t) {
      o.error && o.error(resp, msg, t)
      complete(resp)
    }

    this.request = getRequest(o, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }
  }

  function reqwest(o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  function isArray(a) {
    return Object.prototype.toString.call(a) == '[object Array]'
  }

  function serial(el, cb) {
    var ret = null
      , n = el.name
      , t = el.tagName.toLowerCase()
      , submittable = true // define simply for readability
      , optCb = function(o) { cb(n, normalize(o.value || o.text), submittable) }

    // create a new callback if we don't have one, use this to build a return value
    cb = cb || function(n, v) {
      ret = ret ? (isArray(ret) && ret.push(v) ? ret : [ ret, v ]) : v
    }

    // don't serialize elements that are disabled or without a name allow 'option'
    // to pass through, it should only get here via val()
    if (el.disabled || (!n && t != 'option')) return null

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        var ch = /checkbox/i.test(el.type)
          , ra = /radio/i.test(el.type)
          , val = el.value
        // WebKit gives us "" instead of "on if a checkbox has no value, so correct it here
        cb(n, normalize(ch && val === '' ? 'on' : val), ch || ra ? el.checked : submittable)
      }
      break;
    case 'textarea':
      cb(n, normalize(el.value), submittable)
      break;
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        var o = el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null
        o && !o.disabled ? optCb(o) : cb(n, null, !submittable)
      } else {
        for (var i = 0; el.length && i < el.length; i++) {
          var opt = el.options[i]
          opt.selected && !opt.disabled && optCb(opt)
        }
      }
      break;
    case 'option':
      optCb(el)
    }
    return ret
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement() {
    var cb = this
      , serializeSubtags = function(e, tags) {
        for (var i = 0; i < tags.length; i++) {
          var fa = e[byTag](tags[i])
          for (var j = 0; j < fa.length; j++) serial(fa[j], cb)
        }
      }

    for (var i = 0; i < arguments.length; i++) {
      var e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb);
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }   

  // query string style serialization
  reqwest.serialize = function () {
    var qs = ''
    eachFormElement.apply(function(name, value, submittable) {
      submittable && (qs += name + '=' + encodeURIComponent(value) + '&')
    }, arguments)
    // spaces should be + according to spec
    return qs.replace(/&$/, '').replace(/%20/g,'+')
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function(name, value, submittable) {
      submittable && arr.push({name: name, value: value})
    }, arguments)
    return arr 
  }

  // { 'name': 'value', ... } style serialization
  reqwest.serializeHash = function (form) {
    var hash = {}
    eachFormElement.apply(function(name, value, submittable) {
      if (!submittable) return;
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  reqwest.val = function(e) {
    return serial(e)
  }

  reqwest.noConflict = function () {
    context.reqwest = old
    return this
  }

  return reqwest
})
