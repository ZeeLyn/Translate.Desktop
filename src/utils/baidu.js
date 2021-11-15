/* eslint-disable */
import md5 from "md5"
const __baidu_translate_appid = "20211114000998654";
const __baidu_translate_key = "0gPJopPB9IlfqAb1cS8k";
import request from "@g1100100/rest.request"

export function BaiduTranslate(query, from, to, callback, _err, _finally) {
    var salt = (new Date).getTime();
    var sign_source = `${__baidu_translate_appid}${query}${salt}${__baidu_translate_key}`;
    request.get("http://api.fanyi.baidu.com/api/trans/vip/translate", {
        params: {
            q: query,
            appid: __baidu_translate_appid,
            salt: salt,
            from: from,
            to: to,
            tts: 1,
            dict: 1,
            sign: md5(sign_source)
        }
    }).then(res => {
        callback({ result: res.data.trans_result });
    }).catch(err => {
        if (_err) _err(err);
    }).finally(() => {
        if (_finally) _finally();
    });
}