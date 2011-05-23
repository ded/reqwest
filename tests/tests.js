sink('Mime types', function (test, ok) {
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
  test('JSONP', 3, function() {
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

    reqwest({
      url: '/tests/fixtures/fixtures_jsonp3.js?foo=?',
      type: 'jsonp',
      jsonpCallback: 'foo',
      success: function (resp) {
        ok(resp.boosh == "boosh", "evaluated response as JSONP with custom wildcard callback");
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

sink('Callbacks', function (test, ok) {

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

sink('Connection Object', function (test, ok) {

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

  sink('Serializing', function (test, ok) {

    test('serialize', 1, function () {
      var expected = 'foo=bar&bar=baz&wha=1&wha=3&choices=two&opinions=world%20peace%20is%20not%20real';
      ok(reqwest.serialize(document.forms[0]) == expected, 'serialized form');
    });

    test('serializeArray', 6, function () {
      var expected = [
        { name: 'foo', value: 'bar' },
        { name: 'bar', value: 'baz' },
        { name: 'wha', value: 1 },
        { name: 'wha', value: 3 },
        { name: 'choices', value: 'two' },
        { name: 'opinions', value: 'world%20peace%20is%20not%20real' }
      ];

      var result = reqwest.serializeArray(document.forms[0]);

      for (var i = 0; i < expected.length; i++) {
        ok(result.some(function (v) {
          return v.name == expected[i].name && v.value == expected[i].value;
        }), 'serialized ' + result[i].name);
      }
    });

  });


  sink('Parallel Calls', function (test, ok) {

    test('multiple named callbacks', 4, function () {
      reqwest({
        url: '/tests/fixtures/fixtures_jsonp_multi.js?callback=reqwest_0',
        type: 'jsonp',
        success: function (resp) {
          ok(resp.a == "a", "evaluated response as JSONP");
        }
      });
      reqwest({
        url: '/tests/fixtures/fixtures_jsonp_multi_b.js?callback=reqwest_0',
        type: 'jsonp',
        success: function (resp) {
          ok(resp.b == "b", "evaluated response as JSONP");
        }
      });
      reqwest({
        url: '/tests/fixtures/fixtures_jsonp_multi_c.js?callback=reqwest_0',
        type: 'jsonp',
        success: function (resp) {
          ok(resp.c == "c", "evaluated response as JSONP");
        }
      });
      reqwest({
        url: '/tests/fixtures/fixtures_jsonp_multi.js?callback=reqwest_0',
        type: 'jsonp',
        success: function (resp) {
          ok(resp.a == "a", "evaluated response as JSONP");
        }
      });
    });

  });

});

start();
