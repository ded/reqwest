!function (ajax) {
  sink('Mime types', function (test, ok) {
    test('JSON', 1, function() {
      ajax({
        url: '/tests/fixtures/fixtures.json',
        type: 'json',
        success: function (resp) {
          ok(resp.boosh == 'boosh', 'evaluated response as JSON')
        }
      })
    })

    // For some reason, using the .jsonp file extension didn't work
    // in the testing suite. Using .js instead for now.
    test('JSONP', 3, function() {
      ajax({
        url: '/tests/fixtures/fixtures_jsonp.js?callback=?',
        type: 'jsonp',
        success: function (resp) {
          ok(resp.boosh == "boosh", "evaluated response as JSONP")
        }
      })

      ajax({
        url: '/tests/fixtures/fixtures_jsonp2.js?foo=bar',
        type: 'jsonp',
        jsonpCallback: 'foo',
        success: function (resp) {
          ok(resp.boosh == "boosh", "evaluated response as JSONP with custom callback")
        }
      })

      ajax({
        url: '/tests/fixtures/fixtures_jsonp3.js?foo=?',
        type: 'jsonp',
        jsonpCallback: 'foo',
        success: function (resp) {
          ok(resp.boosh == "boosh", "evaluated response as JSONP with custom wildcard callback")
        }
      })
    })

    test('JS', 1, function() {
      ajax({
        url: '/tests/fixtures/fixtures.js',
        type: 'js',
        success: function (resp) {
          ok(boosh == 'boosh', 'evaluated response as JavaScript')
        }
      })
    })

    test('HTML', 1, function() {
      ajax({
        url: '/tests/fixtures/fixtures.html',
        type: 'html',
        success: function (resp) {
          ok(resp == '<p>boosh</p>', 'evaluated response as HTML')
        }
      })
    })

  })

  sink('Callbacks', function (test, ok) {

    test('no callbacks', 1, function () {
      var pass = true
      try {
        ajax('/tests/fixtures/fixtures.js')
      } catch (ex) {
        pass = false
      } finally {
        ok(pass, 'successfully doesnt fail without callback')
      }
    })

    test('complete is called', 1, function () {
      ajax({
        url: '/tests/fixtures/fixtures.js',
        complete: function () {
          ok(true, 'called complete')
        }
      })
    })

    test('invalid JSON sets error on resp object', 1, function() {
      ajax({
        url: '/tests/fixtures/invalidJSON.json',
        type: 'json',
        success: function (resp) {
          ok(false, 'success callback fired')
        },
        error: function(resp, msg) {
          ok(msg == 'Could not parse JSON in response', 'error callback fired')
        }
      })
    })

    test('multiple parallel named JSONP callbacks', 4, function () {
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp.a == "a", "evaluated response as JSONP")
          }
        });
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi_b.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp.b == "b", "evaluated response as JSONP")
          }
        });
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi_c.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp.c == "c", "evaluated response as JSONP")
          }
        });
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp.a == "a", "evaluated response as JSONP")
          }
        })
      })

  })

  sink('Connection Object', function (test, ok) {

    test('setRequestHeaders', 1, function () {
      ajax({
        url: '/tests/fixtures/fixtures.html',
        data: 'foo=bar&baz=thunk',
        method: 'post',
        headers: {
          'Accept': 'application/x-foo'
        },
        success: function (resp) {
          ok(true, 'can post headers')
        }
      })
    })

    test('can inspect http before send', 2, function () {
      var connection = ajax({
        url: '/tests/fixtures/fixtures.js',
        method: 'post',
        type: 'js',
        before: function (http) {
          ok(http.readyState == 1, 'received http connection object')
        },
        success: function () {
          // Microsoft.XMLHTTP appears not to run this async in IE6&7, it processes the request and
          // triggers success() before ajax() even returns. Perhaps a better solution would be to
          // defer the calls within handleReadyState().
          setTimeout(function() {
            ok(connection.request.readyState == 4, 'success callback has readyState of 4')
          }, 0)
        }
      })
    })

    sink('Serializing', function (test, ok) {

      /*
       * Serialize forms according to spec.
       *  * reqwest.serialize(ele[, ele...]) returns a query string style serialization
       *  * reqwest.serializeArray(ele[, ele...]) returns a [ { name: 'name', value: 'value'}, ... ]
       *    style serialization, compatible with jQuery.serializeArray()
       *  * reqwest.serializeArray(ele[, ele...]) returns a { 'name': 'value', ... } style
       *    serialization, compatible with Prototype Form.serializeElements({hash:true})
       * Some tests based on spec notes here: http://malsup.com/jquery/form/comp/test.html
       */
      test('serialize', 1, function () {
        var expected = 'foo=bar&bar=baz&wha=1&wha=3&who=tawoo&choices=two&opinions=world+peace+is+not+real';
        ok(ajax.serialize(document.forms[0]) == expected, 'serialized form')
      })

      test('serializeArray', 7, function () {
        var expected = [
          { name: 'foo', value: 'bar' },
          { name: 'bar', value: 'baz' },
          { name: 'wha', value: 1 },
          { name: 'wha', value: 3 },
          { name: 'who', value: 'tawoo' },
          { name: 'choices', value: 'two' },
          { name: 'opinions', value: 'world peace is not real' }
        ]

        var result = ajax.serializeArray(document.forms[0]);

        for (var i = 0; i < expected.length; i++) {
          ok(v.some(result, function (v) {
            return v.name == expected[i].name && v.value == expected[i].value
          }), 'serialized ' + result[i].name)
        }
      });

      function sameValue(value, expected) {
        if (expected == null) {
          return value === null
        } else if (isArray(expected)) {
          if (value.length !== expected.length) return false
          for (var i = 0; i < expected.length; i++) {
            if (value[i] != expected[i]) return false
          }
          return true
        } else return value == expected
      }

      test('serializeHash', 7, function () {
        var expected = {
          foo: 'bar',
          bar: 'baz',
          wha: [ "1", "3" ],
          who: 'tawoo',
          choices: 'two',
          opinions: 'world peace is not real'
        }

        var result = ajax.serializeHash(document.forms[0]);

        ok(v.keys(expected).length === v.keys(result).length, "same number of keys")

        v.each(v.keys(expected), function (k) {
          ok(sameValue(expected[k], result[k]), "same value for " + k)
        })

      });

      form = document.forms[1]
      form.reset()

      test('serialize textarea', 5, function() {
        textarea = form.getElementsByTagName('textarea')[0]
        // the texarea has 2 different newline styles, should come out as normalized CRLF as per forms spec
        ok("T3=%3F%0D%0AA+B%0D%0AZ" == ajax.serialize(textarea), "serialize(textarea)")
        var sa = ajax.serializeArray(textarea)
        ok(sa.length == 1, "serializeArray(textarea) returns array")
        sa = sa[0]
        ok("T3" == sa.name, "serializeArray(textarea).name")
        ok("?\r\nA B\r\nZ" == sa.value, "serializeArray(textarea).value")
        ok("?\r\nA B\r\nZ" == ajax.serializeHash(textarea).T3, "serializeHash(textarea)")
      });

      function isArray(a) { return Object.prototype.toString.call(a) == '[object Array]' }

      function verifyInput(input, name, value, str) {
        var sa = ajax.serializeArray(input)
        var sh = ajax.serializeHash(input)

        if (value != null) {
          var av = isArray(value) ? value : [ value ]
          ok(sa.length == av.length, "serializeArray(" + str + ") returns array [{name,value}]")
          for (var i = 0; i < av.length; i++) {
            ok(name == sa[i].name, "serializeArray(" + str + ")[" + i + "].name")
            ok(av[i] == sa[i].value, "serializeArray(" + str + ")[" + i + "].value")
          }

          ok(sameValue(sh[name], value), "serializeHash(" + str + ")")
        } else {
          // the cases where an element shouldn't show up at all, checkbox not checked for example
          ok(sa.length == 0, "serializeArray(" + str + ") is []")

          ok(v.keys(sh).length == 0, "serializeHash(" + str + ") is {}")
        }
      }

      test('serialize input[type=hidden]', 4 + 4, function() {
          verifyInput(form.getElementsByTagName('input')[0], "H1", "x", "hidden")
          verifyInput(form.getElementsByTagName('input')[1], "H2", "", "hidden[no value]")
      });

      test('serialize input[type=password]', 4 + 4, function() {
        verifyInput(form.getElementsByTagName('input')[2], "PWD1", "xyz", "password")
        verifyInput(form.getElementsByTagName('input')[3], "PWD2", "", "password[no value]")
      });

      test('serialize input[type=text]', 4 + 4 + 4, function() {
        verifyInput(form.getElementsByTagName('input')[4], "T1", "", "text[no value]")
        verifyInput(form.getElementsByTagName('input')[5], "T2", "YES", "text[readonly]")
        verifyInput(form.getElementsByTagName('input')[10], "My Name", "me", "text[space name]")
      });
      
      test('serialize input[type=checkbox]', 2 + 4 + 2 + 4, function() {
        var cb1 = form.getElementsByTagName('input')[6]
          , cb2 = form.getElementsByTagName('input')[7]
        verifyInput(cb1, "C1", null, "checkbox[not checked]")
        cb1.checked = true
        verifyInput(cb1, "C1", "1", "checkbox[checked]")
        // special case here, checkbox with no value="" should give you "on" for cb.value
        verifyInput(cb2, "C2", null, "checkbox[no value, not checked]")
        cb2.checked = true
        verifyInput(cb2, "C2", "on", "checkbox[no value, checked]")
      });
      
      test('serialize input[type=radio]', 2 + 4 + 2 + 4, function() {
        var r1 = form.getElementsByTagName('input')[8]
          , r2 = form.getElementsByTagName('input')[9]
        verifyInput(r1, "R1", null, "radio[not checked]")
        r1.checked = true
        verifyInput(r1, "R1", "1", "radio[not checked]")
        verifyInput(r2, "R1", null, "radio[no value, not checked]")
        r2.checked = true
        verifyInput(r2, "R1", "", "radio[no value, checked]")
      });

      test('serialize input[type=reset]', 2, function() {
        verifyInput(form.getElementsByTagName('input')[11], "rst", null, "reset")
      });

      test('serialize input[type=file]', 2, function() {
        verifyInput(form.getElementsByTagName('input')[12], "file", null, "file")
      });

      test('serialize input[type=submit]', 4, function() {
        // we're only supposed to serialize a submit button if it was clicked to perform this
        // serialization: http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2
        // but we'll pretend to be oblivious to this part of the spec...
        verifyInput(form.getElementsByTagName('input')[13], "sub", "NO", "submit")
      });

      test('serialize select with no options', 2, function() {
        var select = form.getElementsByTagName('select')[0]
        verifyInput(select, "S1", null, "select, no options")
      });

      test('serialize select with values', 4 + 4 + 4 + 2, function() {
        var select = form.getElementsByTagName('select')[1]
        verifyInput(select, "S2", "abc", "select option 1 (default)")
        select.selectedIndex = 1
        verifyInput(select, "S2", "def", "select option 2")
        select.selectedIndex = 6
        verifyInput(select, "S2", "disco stu", "select option 7")
        select.selectedIndex = -1
        verifyInput(select, "S2", null, "select, unselected")
      });

      test('serialize select without explicit values', 4 + 4 + 4 + 2, function() {
        var select = form.getElementsByTagName('select')[2]
        verifyInput(select, "S3", "ABC", "select option 1 (default)")
        select.selectedIndex = 1
        verifyInput(select, "S3", "DEF", "select option 2")
        select.selectedIndex = 6
        verifyInput(select, "S3", "DISCO STU!", "select option 7")
        select.selectedIndex = -1
        verifyInput(select, "S3", null, "select, unselected")
      });

      test('serialize select multiple', 2 + 4 + 6 + 8 + 6 + 2, function() {
        var select = form.getElementsByTagName('select')[3]
        verifyInput(select, "S4", null, "select, unselected (default)")
        select.options[1].selected = true
        verifyInput(select, "S4", "2", "select option 2")
        select.options[3].selected = true
        verifyInput(select, "S4", [ "2", "4" ], "select options 2 & 4")
        select.options[8].selected = true
        verifyInput(select, "S4", [ "2", "4", "Disco Stu!" ], "select option 2 & 4 & 9")
        select.options[3].selected = false
        verifyInput(select, "S4", [ "2", "Disco Stu!" ], "select option 2 & 9")
        select.options[1].selected = false
        select.options[8].selected = false
        verifyInput(select, "S4", null, "select, all unselected")
       });

      test('serialize options', 2 + 2, function() {
        var option = form.getElementsByTagName('select')[1].options[6]
        verifyInput(option, "-", null, "just option (with value), shouldn't serialize")
        var option = form.getElementsByTagName('select')[2].options[6]
        verifyInput(option, "-", null, "option (without value), shouldn't serialize")
      });

      test('serialize disabled', 2 + 2 + 2 + 2 + 2 + 2 + 2, function() {
        var input = form.getElementsByTagName('input')[14]
        verifyInput(input, "D1", null, "disabled text input")
        input = form.getElementsByTagName('input')[15]
        verifyInput(input, "D2", null, "disabled checkbox")
        input = form.getElementsByTagName('input')[16]
        verifyInput(input, "D3", null, "disabled radio")
        var select = form.getElementsByTagName('select')[4]
        verifyInput(select, "D4", null, "disabled select")
        select = form.getElementsByTagName('select')[3]
        verifyInput(select, "D5", null, "disabled select option")
        select = form.getElementsByTagName('select')[6]
        verifyInput(select, "D6", null, "disabled multi select")
        select = form.getElementsByTagName('select')[7]
        verifyInput(select, "D7", null, "disabled multi select option")
      });

      var foo = document.forms[0].getElementsByTagName('input')[1]
      var bar = document.forms[0].getElementsByTagName('input')[2]
      var choices = document.forms[0].getElementsByTagName('select')[0]

      // mainly for Ender integration, so you can do this:
      // $('input[name=T2],input[name=who],input[name=wha]').serialize()
      test('serialize with multiple arguments', 1, function() {
          var result = ajax.serialize(foo, bar, choices)
          ok(result == "foo=bar&bar=baz&choices=two", "serialized all 3 arguments together")
      });

      // mainly for Ender integration, so you can do this:
      // $('input[name=T2],input[name=who],input[name=wha]').serializeArray()
      test('serializeArray with multiple arguments', 4, function() {
          var result = ajax.serializeArray(foo, bar, choices)
          ok(result.length == 3, "serialized as array of 3")
          ok(result[0].name == "foo" && result[0].value == "bar", "serialized first element")
          ok(result[1].name == "bar" && result[1].value == "baz", "serialized second element")
          ok(result[2].name == "choices" && result[2].value == "two", "serialized third element")
      });

      // mainly for Ender integration, so you can do this:
      // $('input[name=T2],input[name=who],input[name=wha]').serializeHash()
      test('serializeHash with multiple arguments', 3, function() {
          var result = ajax.serializeHash(foo, bar, choices)
          ok(result.foo == "bar", "serialized first element")
          ok(result.bar == "baz", "serialized second element")
          ok(result.choices == "two", "serialized third element")
      });
    });

  })

  start()

}(reqwest.noConflict())
