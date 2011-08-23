var r = require('reqwest')
ender.ender({
  ajax: r
})
ender.ender({
  serialize: function () {
    return r.serialize(this[0])
  }
  , serializeArray: function() {
    return r.serializeArray(this[0])
  }
}, true)