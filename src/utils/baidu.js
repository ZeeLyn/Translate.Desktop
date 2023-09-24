/* eslint-disable */
import md5 from "md5";
import request from "@zeelyn/http";
// import { ElNotification } from "element-plus";

export function BaiduTranslate(store, query, from, to, callback, _err, _finally) {
    if (!store.baidu.appid || !store.baidu.key) {
        if (_err) _err("请先申请一个免费的百度翻译账号，在右上角设置里填入申请的APPID和秘钥。");
        if (_finally) _finally();
        return;
    }
    var salt = new Date().getTime();
    var sign_source = `${store.baidu.appid}${query}${salt}${store.baidu.key}`;
    request
        .get("http://api.fanyi.baidu.com/api/trans/vip/translate", {
            params: {
                q: query,
                appid: store.baidu.appid,
                salt: salt,
                from: from,
                to: to,
                tts: 1,
                dict: 1,
                sign: md5(sign_source),
            },
        })
        .then((res) => {
            if (res.data.error_code) {
                if (_err) _err(res.data.error_msg);
                // ElNotification.error({
                //     message: res.data.error_msg,
                //     position: "bottom-right",
                // });
            } else callback({ result: res.data.trans_result });
        })
        .catch((err) => {
            if (_err) _err(err);
        })
        .finally(() => {
            if (_finally) _finally();
        });
}
