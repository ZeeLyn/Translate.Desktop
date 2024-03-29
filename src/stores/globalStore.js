import { defineStore } from "pinia";

export const globalStore = defineStore("globalStore", {
    state: () => ({
        baidu: {
            appid: "",
            key: "",
        },
        google: {
            domain: "https://translate.google.com",
        },
        proxy: {
            enable: false,
            host: "",
            port: 0,
        },
    }),
    actions: {
        setBaiduAppId(appid) {
            this.baidu.appid = appid;
            localStorage.setItem("baidu.appid", appid);
        },
        setBaiduAppKey(key) {
            this.baidu.key = key;
            localStorage.setItem("baidu.key", key);
        },
        setGoogleDomain(domain) {
            this.google.domain = domain;
            localStorage.setItem("google.domain", domain);
        },
        setProxy(v) {
            this.proxy = v;
            localStorage.setItem("proxy", JSON.stringify(v));
        },
    },
});
