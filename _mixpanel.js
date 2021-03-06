var MixpanelLib = function (q, r) {
    var s = {},
        super_props_loaded = false;
    s.config = {
        cross_subdomain_cookie: true,
        cookie_name: "mp_super_properties",
        test: false,
        store_google: false,
        debug: false
    };
    s.super_properties = {
        "all": {},
        "events": {},
        "funnels": {}
    };
    s.funnels = {};
    s.send_request = function (a, b) {
        var c = s.callback_fn;
        if (a.indexOf("?") > -1) {
            a += "&callback="
        } else {
            a += "?callback="
        }
        a += c + "&";
        if (b) {
            a += s.http_build_query(b)
        }
        if (s.config.test) {
            a += '&test=1'
        }
        a += '&_=' + new Date().getTime().toString();
        var d = document.createElement("script");
        d.setAttribute("src", a);
        d.setAttribute("type", "text/javascript");
        var e = document.getElementsByTagName("head")[0] || document.documentElement;
        e.insertBefore(d, e.firstChild)
    };
    s.track_funnel = function (a, b, c, d, e) {
        if (!d) {
            d = {}
        }
        d.funnel = a;
        d.step = parseInt(b, 10);
        d.goal = c;
        s.track('mp_funnel', d, e, "funnels")
    };
    s.get_query_param = function (a, b) {
        b = b.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var c = "[\\?&]" + b + "=([^&#]*)";
        var d = new RegExp(c);
        var e = d.exec(a);
        if (e === null || (e && typeof(e[1]) != 'string' && e[1].length)) {
            return ''
        } else {
            return unescape(e[1]).replace(/\+/g, ' ')
        }
    };
    s.track = function (a, b, c, d) {
        s.load_super_once();
        if (!d) {
            d = "events"
        }
        if (!b) {
            b = {}
        }
        if (!b.token) {
            b.token = s.token
        }
        if (c) {
            s.callback = c
        }
        b.time = s.get_unixtime();
        s.save_campaign_params();
        s.save_search_keyword();
        var p;
        if (d != "all") {
            for (p in s.super_properties[d]) {
                if (!b[p]) {
                    b[p] = s.super_properties[d][p]
                }
            }
        }
        if (s.super_properties.all) {
            for (p in s.super_properties.all) {
                if (!b[p]) {
                    b[p] = s.super_properties.all[p]
                }
            }
        }
        var e = {
            'event': a,
            'properties': b
        };
        var f = s.base64_encode(s.json_encode(e));
        if (s.config.debug) {
            if (window.console) {
                console.log("-------------- REQUEST --------------");
                console.log(e)
            }
        }
        s.send_request(s.api_host + '/track/', {
            'data': f,
            'ip': 1
        });
        s.track_predefined_funnels(a, b)
    };
    s.identify = function (a) {
        s.register_once({
            'distinct_id': a
        }, 'all', null, 30)
    };
    s.register_once = function (a, b, c, d) {
        s.load_super_once();
        if (!b || !s.super_properties[b]) {
            b = "all"
        }
        if (!c) {
            c = "None"
        }
        if (!d) {
            d = 7
        }
        if (a) {
            for (var p in a) {
                if (a.hasOwnProperty(p)) {
                    if (!s.super_properties[b][p] || s.super_properties[b][p] == c) {
                        s.super_properties[b][p] = a[p]
                    }
                }
            }
        }
        if (s.config.cross_subdomain_cookie) {
            s.clear_old_cookie()
        }
        s.set_cookie(s.config.cookie_name, s.json_encode(s.super_properties), d, s.config.cross_subdomain_cookie)
    };
    s.register = function (a, b, c) {
        s.load_super_once();
        if (!b || !s.super_properties[b]) {
            b = "all"
        }
        if (!c) {
            c = 7
        }
        if (a) {
            for (var p in a) {
                if (a.hasOwnProperty(p)) {
                    s.super_properties[b][p] = a[p]
                }
            }
        }
        if (s.config.cross_subdomain_cookie) {
            s.clear_old_cookie()
        }
        s.set_cookie(s.config.cookie_name, s.json_encode(s.super_properties), c, s.config.cross_subdomain_cookie)
    };
    s.http_build_query = function (a, b) {
        var c, use_val, use_key, i = 0,
            tmp_arr = [];
        if (!b) {
            b = '&'
        }
        for (c in a) {
            if (c) {
                use_val = encodeURIComponent(a[c].toString());
                use_key = encodeURIComponent(c);
                tmp_arr[i++] = use_key + '=' + use_val
            }
        }
        return tmp_arr.join(b)
    };
    s.get_unixtime = function () {
        return parseInt(new Date().getTime().toString().substring(0, 10), 10)
    };
    s.jsonp_callback = function (a) {
        if (s.callback) {
            s.callback(a);
            s.callback = false
        }
    };
    s.json_encode = function (j) {
        var l;
        var m = j;
        var i;
        var n = function (b) {
            var d = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
            var e = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };
            d.lastIndex = 0;
            return d.test(b) ? '"' + b.replace(d, function (a) {
                var c = e[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
            }) + '"' : '"' + b + '"'
        };
        var o = function (a, b) {
            var c = '';
            var d = '    ';
            var i = 0;
            var k = '';
            var v = '';
            var e = 0;
            var f = c;
            var g = [];
            var h = b[a];
            if (h && typeof h === 'object' && typeof h.toJSON === 'function') {
                h = h.toJSON(a)
            }
            switch (typeof h) {
            case 'string':
                return n(h);
            case 'number':
                return isFinite(h) ? String(h) : 'null';
            case 'boolean':
            case 'null':
                return String(h);
            case 'object':
                if (!h) {
                    return 'null'
                }
                c += d;
                g = [];
                if (Object.prototype.toString.apply(h) === '[object Array]') {
                    e = h.length;
                    for (i = 0; i < e; i += 1) {
                        g[i] = o(i, h) || 'null'
                    }
                    v = g.length === 0 ? '[]' : c ? '[\n' + c + g.join(',\n' + c) + '\n' + f + ']' : '[' + g.join(',') + ']';
                    c = f;
                    return v
                }
                for (k in h) {
                    if (Object.hasOwnProperty.call(h, k)) {
                        v = o(k, h);
                        if (v) {
                            g.push(n(k) + (c ? ': ' : ':') + v)
                        }
                    }
                }
                v = g.length === 0 ? '{}' : c ? '{' + g.join(',') + '' + f + '}' : '{' + g.join(',') + '}';
                c = f;
                return v
            }
        };
        return o('', {
            '': m
        })
    };
    s.base64_encode = function (a) {
        var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var c, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];
        if (!a) {
            return a
        }
        a = s.utf8_encode(a + '');
        do {
            c = a.charCodeAt(i++);
            o2 = a.charCodeAt(i++);
            o3 = a.charCodeAt(i++);
            bits = c << 16 | o2 << 8 | o3;
            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;
            tmp_arr[ac++] = b.charAt(h1) + b.charAt(h2) + b.charAt(h3) + b.charAt(h4)
        } while (i < a.length);
        enc = tmp_arr.join('');
        switch (a.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break
        }
        return enc
    };
    s.utf8_encode = function (a) {
        a = (a + '').replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var b = "";
        var c, end;
        var d = 0;
        c = end = 0;
        d = a.length;
        for (var n = 0; n < d; n++) {
            var e = a.charCodeAt(n);
            var f = null;
            if (e < 128) {
                end++
            } else if ((e > 127) && (e < 2048)) {
                f = String.fromCharCode((e >> 6) | 192) + String.fromCharCode((e & 63) | 128)
            } else {
                f = String.fromCharCode((e >> 12) | 224) + String.fromCharCode(((e >> 6) & 63) | 128) + String.fromCharCode((e & 63) | 128)
            }
            if (f !== null) {
                if (end > c) {
                    b += a.substring(c, end)
                }
                b += f;
                c = end = n + 1
            }
        }
        if (end > c) {
            b += a.substring(c, a.length)
        }
        return b
    };
    s.set_cookie = function (a, b, c, d) {
        var e = new Date(),
            domain = ((d) ? s.parse_domain(document.location.hostname) : ""),
            cookiestring = a + "=" + escape(b);
        e.setDate(e.getDate() + c);
        cookiestring += ((c === null) ? "" : ";expires=" + e.toGMTString());
        cookiestring += "; path=/";
        cookiestring += ((domain) ? ";domain=." + domain : "");
        document.cookie = cookiestring
    };
    s.get_cookie = function (a) {
        var b, c_end;
        if (document.cookie.length > 0) {
            if (document.cookie.match('^' + a + '=')) {
                b = 0
            } else {
                b = document.cookie.search('; ' + a + '=');
                if (b != -1) {
                    b += 2
                }
            }
            if (b != -1) {
                b = b + a.length + 1;
                c_end = document.cookie.indexOf(";", b);
                if (c_end == -1) {
                    c_end = document.cookie.length
                }
                return unescape(document.cookie.substring(b, c_end))
            }
        }
        return ""
    };
    s.delete_cookie = function (a, b) {
        s.set_cookie(a, '', -1, b)
    };
    s.parse_domain = function (a) {
        var b = a.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i);
        return b ? b[0] : ''
    };
    s.get_super = function () {
        var a = eval('(' + s.get_cookie(s.config.cookie_name) + ')');
        if (a) {
            for (var i in a) {
                if (a.hasOwnProperty(i)) {
                    s.super_properties[i] = a[i]
                }
            }
        }
        return s.super_properties
    };
    s.load_super_once = function () {
        if (!super_props_loaded) {
            try {
                s.get_super();
                super_props_loaded = true
            } catch (err) {}
        }
    };
    s.register_funnel = function (a, b) {
        s.funnels[a] = b
    };
    s.track_predefined_funnels = function (a, b) {
        if (a && s.funnels) {
            for (var c in s.funnels) {
                if (s.funnels.hasOwnProperty(c)) {
                    for (var i = 0; i < s.funnels[c].length; ++i) {
                        if (s.funnels[c][i]) {
                            if (s.funnels[c][i] == a) {
                                s.track_funnel(c, i + 1, a, b)
                            }
                        }
                    }
                }
            }
        }
    };
    s.save_campaign_params = function () {
        s.campaign_params_saved = s.campaign_params_saved || false;
        if (s.config.store_google && !s.campaign_params_saved) {
            var a = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
                kw = '',
                params = {};
            for (var b = 0; b < a.length; b++) {
                kw = s.get_query_param(document.URL, a[b]);
                if (kw.length) {
                    params[a[b]] = kw
                }
            }
            s.register_once(params);
            s.campaign_params_saved = true
        }
    };
    s.save_search_keyword = function () {
        if (document.referrer.search('http://(.*)google.com') === 0) {
            var a = s.get_query_param(document.referrer, 'q');
            if (a.length) {
                s.register({
                    'mp_keyword': a
                }, 'funnels')
            }
        }
    };
    s.clear_old_cookie = function () {
        s.delete_cookie(s.config.cookie_name, false);
        s.set_cookie(s.config.cookie_name, s.json_encode(s.super_properties), 7, true)
    };
    s.set_config = function (a) {
        for (var c in a) {
            if (a.hasOwnProperty(c)) {
                s.config[c] = a[c]
            }
        }
    };
    var t = (("https:" == document.location.protocol) ? "https://" : "http://");
    s.token = q;
    s.api_host = t + 'api.mixpanel.com';
    if (r) {
        s.callback_fn = r + '.jsonp_callback'
    } else {
        s.callback_fn = 'mpmetrics.jsonp_callback'
    }
    return s
};
if (typeof mpq != 'undefined' && mpq && mpq[0] && mpq[0][0] == 'init') {
    mpq.metrics = new MixpanelLib(mpq[0][1], "mpq.metrics");
    mpq.push = function (a) {
        if (a) {
            if (typeof a == 'function') {
                a()
            } else if (a.constructor == Array) {
                var f = mpq.metrics[a[0]];
                if (typeof f == 'function') {
                    f.apply(mpq.metrics, a.slice(1))
                }
            }
        }
    };
    for (var i = 1; i < mpq.length; i++) {
        mpq.push(mpq[i])
    }
    mpq.length = 0
}
