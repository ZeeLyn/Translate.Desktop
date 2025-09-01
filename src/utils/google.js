/* eslint-disable */

const { ipcRenderer } = require("electron");
export function GoogleTranslate(store, query, from, to, callback, _err, _finally) {
	var xo = function (a) {
		return function () {
			return a;
		};
	};
	var yo = function (a, b) {
		for (var c = 0; c < b.length - 2; c += 3) {
			var d = b.charAt(c + 2);
			d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
			d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
			a = "+" == b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
		}
		return a;
	};
	var zo = null;
	var window = { TKK: "435819.1958473774" };
	var Ao = function (a) {
		if (null !== zo) var b = zo;
		else {
			b = xo(String.fromCharCode(84));
			var c = xo(String.fromCharCode(75));
			b = [b(), b()];
			b[1] = c();
			b = (zo = window[b.join(c())] || "") || "";
		}
		var d = xo(String.fromCharCode(116));
		c = xo(String.fromCharCode(107));
		d = [d(), d()];
		d[1] = c();
		c = "&" + d.join("") + "=";
		d = b.split(".");
		b = Number(d[0]) || 0;
		for (var e = [], f = 0, g = 0; g < a.length; g++) {
			var k = a.charCodeAt(g);
			128 > k ? (e[f++] = k) : (2048 > k ? (e[f++] = (k >> 6) | 192) : (55296 == (k & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? ((k = 65536 + ((k & 1023) << 10) + (a.charCodeAt(++g) & 1023)), (e[f++] = (k >> 18) | 240), (e[f++] = ((k >> 12) & 63) | 128)) : (e[f++] = (k >> 12) | 224), (e[f++] = ((k >> 6) & 63) | 128)), (e[f++] = (k & 63) | 128));
		}
		a = b;
		for (f = 0; f < e.length; f++) (a += e[f]), (a = yo(a, "+-a^+6"));
		a = yo(a, "+-3^+b+-f");
		a ^= Number(d[1]) || 0;
		0 > a && (a = (a & 2147483647) + 2147483648);
		a %= 1e6;
		return c + (a.toString() + "." + (a ^ b));
	};

	ipcRenderer
		.invoke(
			"$HttpPost",
			`${store.google.domain}/translate_a/single?client=at&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=gt&pc=1&otf=1&ssel=0&tsel=0&kc=1&dj=1`,
			{
				sl: from,
				tl: to,
				q: query,
			},
			{
				timeout: 10 * 1000,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
				},
			}
		)
		.then((res) => {
			// console.log(res);
			// console.log(JSON.stringify(res));
			// var result = res[0]
			// 	.filter((item) => item[0])
			// 	.map((item) => {
			// 		return {
			// 			src: item[1],
			// 			dst: item[0],
			// 		};
			// 	});
			// var rec = res[1]
			// 	? res[1].map((item) => {
			// 			return {
			// 				attr: item[0],
			// 				items: item[2]?.map((x, idx) => {
			// 					var trans = item[2][idx];
			// 					return {
			// 						src: x,
			// 						trans: trans[1],
			// 						rate: trans[3],
			// 					};
			// 				}),
			// 			};
			// 	  })
			// 	: null;
			// var k = res[1]
			// 	? res[1].map((item) => {
			// 			return {
			// 				attr: item[0],
			// 				words: item[2].map((x) => {
			// 					return {
			// 						word: x[0], //词语
			// 						definition: x[1], //释义
			// 					};
			// 				}),
			// 			};
			// 	  })
			// 	: [];
			// var definitions = [];
			// k.forEach((item) => {
			// 	item.words.forEach((x) => {
			// 		definitions.push({
			// 			attr: item.attr,
			// 			word: x.word,
			// 			definition: x.definition?.join(" , "),
			// 		});
			// 	});
			// });
			// console.log(definitions);
			const result =
				res.sentences
					?.filter((x) => "trans" in x)
					?.map((x) => {
						return {
							src: x.orig,
							dst: x.trans,
						};
					}) || [];
			var _dict = [];

			if ("dict" in res) {
				for (let dict of res.dict) {
					for (let entry of dict.entry) {
						_dict.push({
							word: entry.word,
							trans: entry.reverse_translation,
							score: entry.score || 0,
						});
					}
				}
			}
			// console.log(_dict);
			callback({
				result,
				dict: _dict,
				// rec: rec,
				// definitions,
			});
		})
		.catch((err) => {
			if (_err) _err(err);
		})
		.finally(() => {
			if (_finally) _finally();
		});
}
