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
  
  // For some reason, using the .jsonp file extension didn't work
  // in the testing suite. Using .js instead for now.
  test('JSONP', 2, function() {
    reqwest({
      url: '/tests/fixtures/fixtures_jsonp.js?callback=?',
      type: 'jsonp',
      success: function (resp) {
        ok(resp.boosh == "boosh", "evaluated response as JSONP");
      }
    });
    
    reqwest({
      url: '/tests/fixtures/fixtures_jsonp2.js?foo=bar',
      type: 'jsonp',
      jsonpCallback: 'foo',
      success: function (resp) {
        ok(resp.boosh == "boosh", "evaluated response as JSONP with custom callback");
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

  test('setRequestHeaders', 1, function () {
    reqwest({
      url: '/tests/fixtures/fixtures.html',
      data: 'foo=bar&baz=thunk',
      method: 'post',
      headers: {
        'Accept': 'application/x-foo'
      },
      success: function (resp) {
        ok(true, 'can post headers');
      }
    });
  });

  test('can inspect http before send', 2, function () {
    var connection = reqwest({
      url: '/tests/fixtures/fixtures.js',
      method: 'post',
      type: 'js',
      before: function (http) {
        ok(http.readyState == 1, 'received http connection object');
      },
      success: function () {
        ok(connection.request.readyState == 4, 'success callback has readyState of 4');
      }
    });
  });

});
start();