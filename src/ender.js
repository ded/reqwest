ender.ender({
  ajax: reqwest
});
ender.ender({
  serialize: function (f) {
    return reqwest.serialize(ender(f)[0]);
  }
  , serializeArray: function(f) {
    return reqwest.serializeArray(ender(f)[0]);
  }
}, true);