require('smoosh').config({
  "JAVASCRIPT": {
    "DIST_DIR": "./",
    "reqwest": [
      "src/copyright.js",
      "src/reqwest.js"
    ]
  },
  "JSHINT_OPTS": {
    "boss": true,
    "forin": true,
    "curly": true,
    "debug": false,
    "devel": false,
    "evil": true,
    "regexp": false,
    "undef": false,
    "sub": false,
    "white": true,
    "indent": 2,
    "whitespace": true,
    "asi": false
  }
}).run().build().analyze();