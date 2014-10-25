var spawn = require('child_process').spawn
  , server = spawn('node', ['make/tests.js'])
  , fs = require('fs')
  , installedBinary = '/usr/bin/phantomjs';

fs.exists(installedBinary, function(exists) {
  var execPath = exists ? installedBinary : './vendor/phantomjs';
  var phantom = spawn(execPath, ['./phantom.js']);

  phantom.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  phantom.on('exit', function (code, signal) {
    var outcome = code == 0 ? 'passed' : 'failed';
    console.log('Reqwest tests have %s', outcome, code);
    server.kill('SIGHUP');
    process.exit(code);
  })
});
