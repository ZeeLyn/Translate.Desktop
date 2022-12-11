import { defineStore } from "pinia";

export const globalStore = defineStore("globalStore", {
    state: () => ({
        defBiadu: {
            appid: "20211114000998654",
            key: "0gPJopPB9IlfqAb1cS8k",
        },
        baidu: {
            appid: "20211114000998654",
            key: "0gPJopPB9IlfqAb1cS8k",
        },
        google: {
            domain: "https://translate.google.com",
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
    },
});
