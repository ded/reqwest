!function (ajax) {


  var FakeXHR = function() {
    this.args = {}
    FakeXHR.last = this
  }
  FakeXHR.setup = function() {
    FakeXHR.oldxhr = window['XMLHttpRequest']
    FakeXHR.oldaxo = window['ActiveXObject']
    window['XMLHttpRequest'] = FakeXHR
    window['ActiveXObject'] = FakeXHR
    FakeXHR.last = null
  }
  FakeXHR.restore = function() {
    window['XMLHttpRequest'] = FakeXHR.oldxhr
    window['ActiveXObject'] = FakeXHR.oldaxo
  }
  FakeXHR.prototype.methodCallCount = function(name) {
    return this.args[name] ? this.args[name].length : 0
  }
  FakeXHR.prototype.methodCallArgs = function(name, i, j) {
    var a = this.args[name] && this.args[name].length > i ? this.args[name][i] : null
    if (arguments.length > 2) return a && a.length > j ? a[j] : null
    return a
  }
  v.each(['open', 'send', 'setRequestHeader' ], function(f) {
    FakeXHR.prototype[f] = function() {
      if (!this.args[f]) this.args[f] = [];
      this.args[f].push(arguments)
    }
  })

  sink('Mime Types', function (test, ok) {
    test('JSON', 2, function() {
      ajax({
        url: '/tests/fixtures/fixtures.json',
        type: 'json',
        success: function (resp) {
          ok(resp, 'received response')
          ok(resp && resp.boosh == 'boosh', 'correctly evaluated response as JSON')
        }
      })
    })

    // For some reason, using the .jsonp file extension didn't work
    // in the testing suite. Using .js instead for now.
    test('JSONP', 6, function() {
      ajax({
        url: '/tests/fixtures/fixtures_jsonp.js?callback=?',
        type: 'jsonp',
        success: function (resp) {
          ok(resp, 'received response for unique generated callback')
          ok(resp && resp.boosh == "boosh", "correctly evaluated response for unique generated callback as JSONP")
        }
      })

      ajax({
        url: '/tests/fixtures/fixtures_jsonp2.js?foo=bar',
        type: 'jsonp',
        jsonpCallback: 'foo',
        success: function (resp) {
          ok(resp, 'received response for custom callback')
          ok(resp && resp.boosh == "boosh", "correctly evaluated response as JSONP with custom callback")
        }
      })

      ajax({
        url: '/tests/fixtures/fixtures_jsonp3.js?foo=?',
        type: 'jsonp',
        jsonpCallback: 'foo',
        success: function (resp) {
          ok(resp, 'received response for custom wildcard callback')
          ok(resp && resp.boosh == "boosh", "correctly evaluated response as JSONP with custom wildcard callback")
        }
      })
    })

    test('JS', 1, function() {
      ajax({
        url: '/tests/fixtures/fixtures.js',
        type: 'js',
        success: function (resp) {
          ok(typeof boosh !== 'undefined' && boosh == 'boosh', 'evaluated response as JavaScript')
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

    test('multiple parallel named JSONP callbacks', 8, function () {
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp, 'received response from call #1')
            ok(resp && resp.a == "a", "evaluated response from call #1 as JSONP")
          }
        });
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi_b.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp, 'received response from call #2')
            ok(resp && resp.b == "b", "evaluated response from call #2 as JSONP")
          }
        });
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi_c.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp, 'received response from call #2')
            ok(resp && resp.c == "c", "evaluated response from call #3 as JSONP")
          }
        });
        ajax({
          url: '/tests/fixtures/fixtures_jsonp_multi.js?callback=reqwest_0',
          type: 'jsonp',
          success: function (resp) {
            ok(resp, 'received response from call #2')
            ok(resp && resp.a == "a", "evaluated response from call #4 as JSONP")
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

      test('ajax() encodes array `data`', 3, function() {
        FakeXHR.setup()
        try {
          ajax({
            url: '/tests/fixtures/fixtures.html',
            method: 'post',
            data: [ { name: 'foo', value: 'bar' }, { name: 'baz', value: 'thunk' }]
          })
          ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
          ok(FakeXHR.last.methodCallArgs('send', 0).length == 1, 'send called with 1 arg')
          ok(FakeXHR.last.methodCallArgs('send', 0, 0) == 'foo=bar&baz=thunk', 'send called with encoded array')
        } finally {
          FakeXHR.restore()
        }
      })

      test('ajax() encodes hash `data`', 3, function() {
        FakeXHR.setup()
        try {
          ajax({
            url: '/tests/fixtures/fixtures.html',
            method: 'post',
            data: { bar: 'foo', thunk: 'baz' }
          })
          ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
          ok(FakeXHR.last.methodCallArgs('send', 0).length == 1, 'send called with 1 arg')
          ok(FakeXHR.last.methodCallArgs('send', 0, 0) == 'bar=foo&thunk=baz', 'send called with encoded array')
        } finally {
          FakeXHR.restore()
        }
      })

      test('ajax() obeys `processData`', 3, function() {
        FakeXHR.setup()
        try {
          var d = { bar: 'foo', thunk: 'baz' }
          ajax({
            url: '/tests/fixtures/fixtures.html',
            processData: false,
            method: 'post',
            data: d
          })
          ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
          ok(FakeXHR.last.methodCallArgs('send', 0).length == 1, 'send called with 1 arg')
          ok(FakeXHR.last.methodCallArgs('send', 0, 0) === d, 'send called with exact `data` object')
        } finally {
          FakeXHR.restore()
        }
      })

      function testXhrGetUrlAdjustment(url, data, expectedUrl) {
        FakeXHR.setup()
        try {
          ajax({
            url: url,
            data: data
          })
          ok(FakeXHR.last.methodCallCount('open') == 1, 'open called')
          ok(FakeXHR.last.methodCallArgs('open', 0).length == 3, 'open called with 3 args')
          ok(FakeXHR.last.methodCallArgs('open', 0, 0) == 'GET', 'first arg of open() is "GET"')
          ok(FakeXHR.last.methodCallArgs('open', 0, 1) == expectedUrl
            , 'second arg of open() is URL with query string')
          ok(FakeXHR.last.methodCallArgs('open', 0, 2) === true, 'third arg of open() is `true`')
          ok(FakeXHR.last.methodCallCount('send') == 1, 'send called')
          ok(FakeXHR.last.methodCallArgs('send', 0).length == 1, 'send called with 1 arg')
          ok(FakeXHR.last.methodCallArgs('send', 0, 0) === null, 'send called with null')
        } finally {
          FakeXHR.restore()
        }
      }

      test('ajax() appends GET URL with ?`data`', 8, function() {
        testXhrGetUrlAdjustment('/tests/fixtures/fixtures.html', 'bar=foo&thunk=baz', '/tests/fixtures/fixtures.html?bar=foo&thunk=baz')
      })

      test('ajax() appends GET URL with ?`data` (serialized object)', 8, function() {
        testXhrGetUrlAdjustment('/tests/fixtures/fixtures.html', { bar: 'foo', thunk: 'baz' }, '/tests/fixtures/fixtures.html?bar=foo&thunk=baz')
      })

      test('ajax() appends GET URL with &`data` (serialized array)', 8, function() {
        testXhrGetUrlAdjustment('/tests/fixtures/fixtures.html?x=y',
          [ { name: 'bar', value: 'foo'}, {name: 'thunk', value: 'baz' } ],
          '/tests/fixtures/fixtures.html?x=y&bar=foo&thunk=baz')
      })
    })

    // define some helpers for the serializer tests that are used often and shared with
    // the ender integration tests

    var BIND_ARGS = 'bind'
      , PASS_ARGS = 'pass'

    var sHelper = (function() {
      var forms = document.forms
        , foo = forms[0].getElementsByTagName('input')[1]
        , bar = forms[0].getElementsByTagName('input')[2]
        , choices = forms[0].getElementsByTagName('select')[0]
        , BIND_ARGS = 'bind'
        , PASS_ARGS = 'pass'

      function reset() {
        forms[1].reset()
      }
      
      function formElements(formIndex, tagName, elementIndex) {
        return forms[formIndex].getElementsByTagName(tagName)[elementIndex]
      }
      
      function isArray(a) {
        return Object.prototype.toString.call(a) == '[object Array]'
      }

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
      
      function verifyInput(input, name, value, str) {
        var sa = ajax.serializeArray(input)
        var sh = ajax.serializeHash(input)

        if (value != null) {
          var av = isArray(value) ? value : [ value ]
          ok(sa.length == av.length, 'serializeArray(' + str + ') returns array [{name,value}]')
          for (var i = 0; i < av.length; i++) {
            ok(name == sa[i].name, 'serializeArray(' + str + ')[' + i + '].name')
            ok(av[i] == sa[i].value, 'serializeArray(' + str + ')[' + i + '].value')
          }

          ok(sameValue(sh[name], value), 'serializeHash(' + str + ')')
        } else {
          // the cases where an element shouldn't show up at all, checkbox not checked for example
          ok(sa.length == 0, 'serializeArray(' + str + ') is []')
          ok(v.keys(sh).length == 0, 'serializeHash(' + str + ') is {}')
        }
      }

      function verifyFormSerialize(method, type) {
        var expected = 'foo=bar&bar=baz&wha=1&wha=3&who=tawoo&%24escapable+name%24=escapeme&choices=two&opinions=world+peace+is+not+real';
        ok(method, 'serialize() bound to context')
        ok((method ? method(forms[0]) : null) == expected, 'serialized form (' + type + ')')
      }

      function executeMultiArgumentMethod(method, argType) {
        return argType === BIND_ARGS ? method.call([foo, bar, choices]) : method(foo, bar, choices)
      }

      function verifyMultiArgumentSerialize(method, type, argType) {
        ok(method, 'serialize() bound in context')
        var result = method ? executeMultiArgumentMethod(method, argType) : null
        ok(result == "foo=bar&bar=baz&choices=two", "serialized all 3 arguments together")
      }

      function verifyFormSerializeArray(method, type) {
        var expected = [
          { name: 'foo', value: 'bar' },
          { name: 'bar', value: 'baz' },
          { name: 'wha', value: 1 },
          { name: 'wha', value: 3 },
          { name: 'who', value: 'tawoo' },
          { name: '$escapable name$', value: 'escapeme' },
          { name: 'choices', value: 'two' },
          { name: 'opinions', value: 'world peace is not real' }
        ]

        ok(method, 'serializeArray() bound to context')

        var result = method ? method(forms[0]) : [];

        for (var i = 0; i < expected.length; i++) {
          ok(v.some(result, function (v) {
            return v.name == expected[i].name && v.value == expected[i].value
          }), 'serialized ' + expected[i].name + ' (' + type + ')')
        }
      }

      function verifyMultiArgumentSerializeArray(method, type, argType) {
          ok(method, 'serializeArray() bound to context')
          var result = method ? executeMultiArgumentMethod(method, argType) : []
          ok(result.length == 3, 'serialized as array of 3')
          ok(result.length == 3 && result[0].name == 'foo' && result[0].value == 'bar', 'serialized first element (' + type + ')')
          ok(result.length == 3 && result[1].name == 'bar' && result[1].value == 'baz', 'serialized second element (' + type + ')')
          ok(result.length == 3 && result[2].name == 'choices' && result[2].value == 'two', 'serialized third element (' + type + ')')
        }

      function verifyFormSerializeHash(method, type) {
        var expected = {
          foo: 'bar',
          bar: 'baz',
          wha: [ "1", "3" ],
          who: 'tawoo',
          '$escapable name$': 'escapeme',
          choices: 'two',
          opinions: 'world peace is not real'
        }

        ok(method, 'serializeHash() bound to context')

        var result = method ? method(forms[0]) : {};

        ok(v.keys(expected).length === v.keys(result).length, 'same number of keys (' + type + ')')

        v.each(v.keys(expected), function (k) {
          ok(sameValue(expected[k], result[k]), 'same value for ' + k + ' (' + type + ')')
        })
      }

      function verifyMultiArgumentSerializeHash(method, type, argType) {
        ok(method, 'serializeHash() bound to context')
        var result = method ? executeMultiArgumentMethod(method, argType) : {}
        ok(result.foo == 'bar', 'serialized first element (' + type + ')')
        ok(result.bar == 'baz', 'serialized second element (' + type + ')')
        ok(result.choices == 'two', 'serialized third element (' + type + ')')
      }
      
      return {
        reset: reset
        , formElements: formElements
        , verifyInput: verifyInput
        , verifyFormSerialize: verifyFormSerialize
        , verifyMultiArgumentSerialize: verifyMultiArgumentSerialize
        , verifyFormSerializeArray: verifyFormSerializeArray
        , verifyMultiArgumentSerializeArray: verifyMultiArgumentSerializeArray
        , verifyFormSerializeHash: verifyFormSerializeHash
        , verifyMultiArgumentSerializeHash: verifyMultiArgumentSerializeHash
      }
    })()

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

      sHelper.reset()

      test('correctly serialize textarea', 5, function() {
        textarea = sHelper.formElements(1, 'textarea', 0)
        // the texarea has 2 different newline styles, should come out as normalized CRLF as per forms spec
        ok('T3=%3F%0D%0AA+B%0D%0AZ' == ajax.serialize(textarea), 'serialize(textarea)')
        var sa = ajax.serializeArray(textarea)
        ok(sa.length == 1, 'serializeArray(textarea) returns array')
        sa = sa[0]
        ok('T3' == sa.name, 'serializeArray(textarea).name')
        ok('?\r\nA B\r\nZ' == sa.value, 'serializeArray(textarea).value')
        ok('?\r\nA B\r\nZ' == ajax.serializeHash(textarea).T3, 'serializeHash(textarea)')
      });

      test('correctly serialize input[type=hidden]', 4 + 4, function() {
          sHelper.verifyInput(sHelper.formElements(1, 'input', 0), 'H1', 'x', 'hidden')
          sHelper.verifyInput(sHelper.formElements(1, 'input', 1), 'H2', '', 'hidden[no value]')
      });

      test('correctly serialize input[type=password]', 4 + 4, function() {
        sHelper.verifyInput(sHelper.formElements(1, 'input', 2), 'PWD1', 'xyz', 'password')
        sHelper.verifyInput(sHelper.formElements(1, 'input', 3), 'PWD2', '', 'password[no value]')
      });

      test('correctly serialize input[type=text]', 4 + 4 + 4, function() {
        sHelper.verifyInput(sHelper.formElements(1, 'input', 4), 'T1', '', 'text[no value]')
        sHelper.verifyInput(sHelper.formElements(1, 'input', 5), 'T2', 'YES', 'text[readonly]')
        sHelper.verifyInput(sHelper.formElements(1, 'input', 10), 'My Name', 'me', 'text[space name]')
      });
      
      test('correctly serialize input[type=checkbox]', 2 + 4 + 2 + 4, function() {
        var cb1 = sHelper.formElements(1, 'input', 6)
          , cb2 = sHelper.formElements(1, 'input', 7)
        sHelper.verifyInput(cb1, 'C1', null, 'checkbox[not checked]')
        cb1.checked = true
        sHelper.verifyInput(cb1, 'C1', '1', 'checkbox[checked]')
        // special case here, checkbox with no value='' should give you 'on' for cb.value
        sHelper.verifyInput(cb2, 'C2', null, 'checkbox[no value, not checked]')
        cb2.checked = true
        sHelper.verifyInput(cb2, 'C2', 'on', 'checkbox[no value, checked]')
      });
      
      test('correctly serialize input[type=radio]', 2 + 4 + 2 + 4, function() {
        var r1 = sHelper.formElements(1, 'input', 8)
          , r2 = sHelper.formElements(1, 'input', 9)
        sHelper.verifyInput(r1, 'R1', null, 'radio[not checked]')
        r1.checked = true
        sHelper.verifyInput(r1, 'R1', '1', 'radio[not checked]')
        sHelper.verifyInput(r2, 'R1', null, 'radio[no value, not checked]')
        r2.checked = true
        sHelper.verifyInput(r2, 'R1', '', 'radio[no value, checked]')
      });

      test('correctly serialize input[type=reset]', 2, function() {
        sHelper.verifyInput(sHelper.formElements(1, 'input', 11), 'rst', null, 'reset')
      });

      test('correctly serialize input[type=file]', 2, function() {
        sHelper.verifyInput(sHelper.formElements(1, 'input', 12), 'file', null, 'file')
      });

      test('correctly serialize input[type=submit]', 4, function() {
        // we're only supposed to serialize a submit button if it was clicked to perform this
        // serialization: http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2
        // but we'll pretend to be oblivious to this part of the spec...
        sHelper.verifyInput(sHelper.formElements(1, 'input', 13), 'sub', 'NO', 'submit')
      });

      test('correctly serialize select with no options', 2, function() {
        var select = sHelper.formElements(1, 'select', 0)
        sHelper.verifyInput(select, 'S1', null, 'select, no options')
      });

      test('correctly serialize select with values', 4 + 4 + 4 + 2, function() {
        var select = sHelper.formElements(1, 'select', 1)
        sHelper.verifyInput(select, 'S2', 'abc', 'select option 1 (default)')
        select.selectedIndex = 1
        sHelper.verifyInput(select, 'S2', 'def', 'select option 2')
        select.selectedIndex = 6
        sHelper.verifyInput(select, 'S2', 'disco stu', 'select option 7')
        select.selectedIndex = -1
        sHelper.verifyInput(select, 'S2', null, 'select, unselected')
      });

      test('correctly serialize select without explicit values', 4 + 4 + 4 + 2, function() {
        var select = sHelper.formElements(1, 'select', 2)
        sHelper.verifyInput(select, 'S3', 'ABC', 'select option 1 (default)')
        select.selectedIndex = 1
        sHelper.verifyInput(select, 'S3', 'DEF', 'select option 2')
        select.selectedIndex = 6
        sHelper.verifyInput(select, 'S3', 'DISCO STU!', 'select option 7')
        select.selectedIndex = -1
        sHelper.verifyInput(select, 'S3', null, 'select, unselected')
      });

      test('correctly serialize select multiple', 2 + 4 + 6 + 8 + 6 + 2, function() {
        var select = sHelper.formElements(1, 'select', 3)
        sHelper.verifyInput(select, 'S4', null, 'select, unselected (default)')
        select.options[1].selected = true
        sHelper.verifyInput(select, 'S4', '2', 'select option 2')
        select.options[3].selected = true
        sHelper.verifyInput(select, 'S4', [ '2', '4' ], 'select options 2 & 4')
        select.options[8].selected = true
        sHelper.verifyInput(select, 'S4', [ '2', '4', 'Disco Stu!' ], 'select option 2 & 4 & 9')
        select.options[3].selected = false
        sHelper.verifyInput(select, 'S4', [ '2', 'Disco Stu!' ], 'select option 2 & 9')
        select.options[1].selected = false
        select.options[8].selected = false
        sHelper.verifyInput(select, 'S4', null, 'select, all unselected')
       });

      test('correctly serialize options', 2 + 2, function() {
        var option = sHelper.formElements(1, 'select', 1).options[6]
        sHelper.verifyInput(option, '-', null, 'just option (with value), shouldn\'t serialize')
        var option = sHelper.formElements(1, 'select', 2).options[6]
        sHelper.verifyInput(option, '-', null, 'option (without value), shouldn\'t serialize')
      });

      test('correctly serialize disabled', 2 + 2 + 2 + 2 + 2 + 2 + 2, function() {
        var input = sHelper.formElements(1, 'input', 14)
        sHelper.verifyInput(input, 'D1', null, 'disabled text input')
        input = sHelper.formElements(1, 'input', 15)
        sHelper.verifyInput(input, 'D2', null, 'disabled checkbox')
        input = sHelper.formElements(1, 'input', 16)
        sHelper.verifyInput(input, 'D3', null, 'disabled radio')
        var select = sHelper.formElements(1, 'select', 4)
        sHelper.verifyInput(select, 'D4', null, 'disabled select')
        select = sHelper.formElements(1, 'select', 3)
        sHelper.verifyInput(select, 'D5', null, 'disabled select option')
        select = sHelper.formElements(1, 'select', 6)
        sHelper.verifyInput(select, 'D6', null, 'disabled multi select')
        select = sHelper.formElements(1, 'select', 7)
        sHelper.verifyInput(select, 'D7', null, 'disabled multi select option')
      });

      test('serialize(form)', 2, function () {
        sHelper.verifyFormSerialize(ajax.serialize, 'direct')
      })

      test('serializeArray(form)', 9, function () {
        sHelper.verifyFormSerializeArray(ajax.serializeArray, 'direct')
      });

      test('serializeHash(form)', 9, function () {
        sHelper.verifyFormSerializeHash(ajax.serializeHash, 'direct')
      });

      // mainly for Ender integration, so you can do this:
      // $('input[name=T2],input[name=who],input[name=wha]').serialize()
      test('serialize(element, element, element...)', 2, function() {
        sHelper.verifyMultiArgumentSerialize(ajax.serialize, 'direct', PASS_ARGS)
      });

      // mainly for Ender integration, so you can do this:
      // $('input[name=T2],input[name=who],input[name=wha]').serializeArray()
      test('serializeArray(element, element, element...)', 5, function() {
          sHelper.verifyMultiArgumentSerializeArray(ajax.serializeArray, 'direct', PASS_ARGS)
      });

      // mainly for Ender integration, so you can do this:
      // $('input[name=T2],input[name=who],input[name=wha]').serializeHash()
      test('serializeHash(element, element, element...)', 4, function() {
          sHelper.verifyMultiArgumentSerializeHash(ajax.serializeHash, 'direct', PASS_ARGS)
      });

      test('serialize([{ name: x, value: y }, ... ]) name/value array serialization', 2, function() {
        var arr = [ { name: 'foo', value: 'bar' }, {name: 'baz', value: ''}, { name: 'x', value: -20 }, { name: 'x', value: 20 }  ]
        ok(ajax.serialize(arr) == "foo=bar&baz=&x=-20&x=20", "simple")
        var arr = [ { name: 'dotted.name.intact', value: '$@%' }, { name: '$ $', value: 20 }, { name: 'leave britney alone', value: 'waa haa haa' } ]
        ok(ajax.serialize(arr) == "dotted.name.intact=%24%40%25&%24+%24=20&leave+britney+alone=waa+haa+haa", "escaping required")
      });

      test('serialize({name: value,...} complex object serialization', 2, function() {
        var obj = { 'foo': 'bar', 'baz': '', 'x': -20 }
        ok(ajax.serialize(obj) == "foo=bar&baz=&x=-20", "simple")
        var obj = { 'dotted.name.intact': '$@%', '$ $': 20, 'leave britney alone': 'waa haa haa' }
        ok(ajax.serialize(obj) == "dotted.name.intact=%24%40%25&%24+%24=20&leave+britney+alone=waa+haa+haa", "escaping required")
      });

      test('serialize({name: [ value1, value2 ...],...} object with arrays serialization', 1, function() {
        var obj = { 'foo': 'bar', 'baz': [ '', '', 'boo!' ], 'x': [ -20, 2.2, 20 ] }
        ok(ajax.serialize(obj) == "foo=bar&baz=&baz=&baz=boo!&x=-20&x=2.2&x=20", "object with arrays")
      });
    });

    sink('Ender Integration', function (test, ok) {
      test('$.ajax alias for reqwest, not bound to boosh', 1, function() {
        ok(ender.ajax === ajax, '$.ajax is reqwest');
      });

      // sHelper.verify that you can do $.serialize(form)
      test('$.serialize(form)', 2, function() {
        sHelper.verifyFormSerialize(ender.serialize, 'ender')
      });

      // sHelper.verify that you can do $.serializeArray(form)
      test('$.serializeArray(form)', 9, function () {
        sHelper.verifyFormSerializeArray(ender.serializeArray, 'ender')
      });

      // sHelper.verify that you can do $.serializeHash(form)
      test('$.serializeHash(form)', 9, function () {
        sHelper.verifyFormSerializeHash(ender.serializeHash, 'ender')
      });

      // sHelper.verify that you can do $.serializeObject(form)
      test('$.serializeObject alias for serializeHash', 1, function() {
        ok(ender.serializeObject != null && ender.serializeObject === ender.serializeHash, 'not null and same ref')
      });

      test('$.serialize(element, element, element...)', 2, function() {
        sHelper.verifyMultiArgumentSerialize(ender.serialize, 'ender', PASS_ARGS)
      });

      test('$.serializeArray(element, element, element...)', 5, function() {
        sHelper.verifyMultiArgumentSerializeArray(ender.serializeArray, 'ender', PASS_ARGS)
      });
      
      test('$.serializeHash(element, element, element...)', 4, function() {
        sHelper.verifyMultiArgumentSerializeHash(ender.serializeHash, 'ender', PASS_ARGS)
      });

      test('$(element, element, element...).serialize()', 2, function() {
        sHelper.verifyMultiArgumentSerialize(ender._boosh.serialize, 'ender', BIND_ARGS)
      });

      test('$(element, element, element...).serializeArray()', 5, function() {
        sHelper.verifyMultiArgumentSerializeArray(ender._boosh.serializeArray, 'ender', BIND_ARGS)
      });
        
      test('$(element, element, element...).serializeHash()', 4, function() {
        sHelper.verifyMultiArgumentSerializeHash(ender._boosh.serializeHash, 'ender', BIND_ARGS)
      });

    });

  })

  start()

}(reqwest.noConflict())
