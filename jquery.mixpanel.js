/**
 Example usage
 $('.students-links').mixpanel({
     mixpanel_data: {
            event: "my-event",
            properties: {
                "something":'about'
            }
     }
     ,token: "YOUR-TOKEN"
     ,callback: function(element){
        window.location = $(element).attr("href");
     }
 });
 */

(function($){
    /**Track a particular event for a set of elements and perform a callback*/
    $.fn.mixpanel = function(options){
        var settings = $.extend(true,{
            event : 'click'                         //the event in which to bind the tracking
            ,mixpanel_data: {
                    event: "YOUR-EVENT"             //the event to report to mixpanel
                    ,properties: {
                        //ip, token, time, YOUR-PROPERTIES
                    }                           
                }
            ,token : 'YOUR-TOKEN'
            ,callback: function(e){window.location = $(e).attr("href");} //for convenience, assume the element is a link
            ,debug: false
        }, options);

        return this.each(function(index, element){
            $(element).bind(settings.event+".mixpanel", function(e){
                e.preventDefault(); //deactivate clicks and stuff
                data = settings.mixpanel_data;
                //update the time
                if(!data.properties.time){
                    data.properties.time = parseInt(new Date().getTime().toString().substring(0, 10), 10); 
                }
                //apply lambda properties:
                for(property in data.properties){
                    if(typeof data.properties[property] === "function")
                        data.properties[property] = data.properties[property](element);
                }
                data.properties.token = settings.token;
                $.ajax({
                       url: "http://api.mixpanel.com/track/"
                      ,data:{
                        data: mixpanel_utils.base64_encode(mixpanel_utils.json_encode(data))
                        ,ip: 1
                      }
                      ,complete:function(jqXHR, status){ //call this regardless of the status of the response
                        if(settings.debug && typeof window.console != "undefined") 
                            console.log("Mixpanel response "+ status);
                        settings.callback(element);
                      }
                      ,dataType: 'jsonp'
                    });
            });
        });
    };

    /**
      ``mixpanel_utils``taken directly from mixpanel's original js code:
        http://api.mixpanel.com/site_media/js/api/mixpanel.js
        and inspected via jsbeautifier:
        http://jsbeautifier.org/
    */
    mixpanel_utils= new function(){
        this.json_encode = function (j) {
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

        this.base64_encode = function (a) {
            var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var c, o2, o3, h1, h2, h3, h4, bits, i = 0,
                ac = 0,
                enc = "",
                tmp_arr = [];
            if (!a) {
                return a
            }
            a = this.utf8_encode(a + '');
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
        this.utf8_encode = function (a) {
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
    };
})(jQuery);
