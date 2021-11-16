/* eslint-disable */

import request from "@g1100100/rest.request"

export function GoogleTranslate(query, from, to, callback, _err, _finally) {
    var xo = function(a) { return function() { return a } };
    var yo = function(a, b) {
        for (var c = 0; c < b.length - 2; c += 3) {
            var d = b.charAt(c + 2);
            d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
            d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
            a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
        }
        return a
    };
    var zo = null;
    var window = { TKK: "435819.1958473774" };
    var Ao = function(a) {
        if (null !== zo) var b = zo;
        else {
            b = xo(String.fromCharCode(84));
            var c = xo(String.fromCharCode(75));
            b = [b(), b()];
            b[1] = c();
            b = (zo = window[b.join(c())] || "") || ""
        }
        var d = xo(String.fromCharCode(116));
        c = xo(String.fromCharCode(107));
        d = [d(), d()];
        d[1] = c();
        c = "&" + d.join("") +
            "=";
        d = b.split(".");
        b = Number(d[0]) || 0;
        for (var e = [], f = 0, g = 0; g < a.length; g++) {
            var k = a.charCodeAt(g);
            128 > k ? e[f++] = k : (2048 > k ? e[f++] = k >> 6 | 192 : (55296 == (k & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (k = 65536 + ((k & 1023) << 10) + (a.charCodeAt(++g) & 1023), e[f++] = k >> 18 | 240, e[f++] = k >> 12 & 63 | 128) : e[f++] = k >> 12 | 224, e[f++] = k >> 6 & 63 | 128), e[f++] = k & 63 | 128)
        }
        a = b;
        for (f = 0; f < e.length; f++) a += e[f], a = yo(a, "+-a^+6");
        a = yo(a, "+-3^+b+-f");
        a ^= Number(d[1]) || 0;
        0 > a && (a = (a & 2147483647) + 2147483648);
        a %= 1E6;
        return c + (a.toString() + "." +
            (a ^ b))
    };
    request.get(`https://translate.google.com/translate_a/single?client=webapp&ie=UTF-8&sl=${from}&tl=${to}&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=gt&pc=1&otf=1&ssel=0&tsel=0&kc=1&tk=${Ao(query)}`, {

        params: {
            q: query
        }
    }).then(res => {
        var result = res.data[0].filter(item => item[0]).map(item => {
            return {
                src: item[1],
                dst: item[0]
            }
        });
        var rec = res.data[1] ? res.data[1].map(item => {
            return {
                attr: item[0],
                items: item[1].map((x, idx) => {
                    var trans = item[2][idx];
                    var p = {
                        src: x,
                        trans: trans[1],
                        rate: trans[3]
                    }
                    return p;
                })
            }
        }) : null;
        callback({
            result,
            rec: rec
        });
    }).catch(err => {
        if (_err) _err(err);
    }).finally(() => {
        if (_finally) _finally();
    });
}