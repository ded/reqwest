!function ($) {
  var r = require('reqwest')
    , integrate = function(method) {
      return function() {
        return r[method].apply(null, this)
      }
    };

  var sh = integrate('serializeHash')

  $.ender({
    ajax: r
    , serialize: integrate('serialize')
    , serializeArray: integrate('serializeArray')
    , serializeHash: sh
    , serializeObject: sh
  }, true)
}(ender);
