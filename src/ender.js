!function ($) {
  var r = require('reqwest')
    , integrate = function(method) {
      return function() {
        var args = arguments.length > 0 ? arguments : this
        return r[method].apply(null, args)
      }
    }
    , s = integrate('serialize')
    , sh = integrate('serializeHash')
    , sa = integrate('serializeArray')

  $.ender({
    ajax: r
    , serialize: s
    , serializeArray: sa
    , serializeHash: sh
    , serializeObject: sh
  })

  $.ender({
    serialize: s
    , serializeArray: sa
    , serializeHash: sh
    , serializeObject: sh
  }, true)
}(ender);
