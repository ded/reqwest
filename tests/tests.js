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

});
start();