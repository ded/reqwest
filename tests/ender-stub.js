window['require'] = function(name) {
  return window[name]
}
window['ender'] = {
  ender: function(m) {
    for (i in m) ender[i] = m[i]
  }
}
