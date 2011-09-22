!function ($) {
  var r = require('reqwest')
    , integrate = function(method) {
      return function() {
        var args = arguments.length > 0 ? arguments : this
        return r[method].apply(null, args)
      }
    };

  var sh = integrate('serializeHash')

  $.ender({
    ajax: r
  })

  $.ender({
    serialize: integrate('serialize')
    , serializeArray: integrate('serializeArray')
    , serializeHash: sh
    , serializeObject: sh
  }, true)
}(ender);
