sink('Reqwest', function(test, ok, before, after) {
  test('JSON', 1, function() {
    reqwest({
      url: '/tests/fixtures/fixtures.json',
      type: 'json',
      success: function (resp) {
        ok(resp.boosh == 'boosh', 'evaluated response as JSON');
      }
    });
  });

  test('JS', 1, function() {
    reqwest({
      url: '/tests/fixtures/fixtures.js',
      type: 'js',
      success: function (resp) {
        ok(boosh == 'boosh', 'evaluated response as JavaScript');
      }
    });
  });

  test('HTML', 1, function() {
    reqwest({
      url: '/tests/fixtures/fixtures.html',
      type: 'html',
      success: function (resp) {
        ok(resp == '<p>boosh</p>', 'evaluated response as HTML');
      }
    });
  });

  test('no callbacks', 1, function () {
    var pass = true;
    try {
      reqwest('/tests/fixtures/fixtures.js');
    } catch (ex) {
      pass = false;
    } finally {
      ok(pass, 'successfully doesnt fail without callback');
    }
  });

  test('complete is called', 1, function () {
    reqwest({
      url: '/tests/fixtures/fixtures.js',
      complete: function () {
        ok(true, 'called complete');
      }
    });
  });

});
start();