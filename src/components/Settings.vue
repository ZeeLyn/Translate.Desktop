<template>
    <div>
        <el-form label-width="auto">
            <el-divider> 百度翻译 </el-divider>
            <el-alert type="warning" :closable="false" style="margin-bottom: 10px"> 百度翻译API有访问限制，可以点击此链接<a href="http://api.fanyi.baidu.com" target="_blank">http://api.fanyi.baidu.com</a>自己申请一个账号，免费的。 </el-alert>
            <el-form-item label="APP ID">
                <el-input v-model="baidu.appid" placeholder="请输入百度翻译APP ID" clearable></el-input>
            </el-form-item>
            <el-form-item label="密钥">
                <el-input v-model="baidu.key" placeholder="请输入百度翻译API秘钥" clearable type="password" show-password></el-input>
            </el-form-item>

            <el-divider> Google翻译 </el-divider>
            <el-form-item label="域名">
                <el-select v-model="google.domain" style="width: 100%" :loading="loading" placement="top">
                    <template #prefix> {{ google.domain == "https://translate.google.com" ? "官方" : "镜像" }}： </template>
                    <el-option label="https://translate.google.com" value="https://translate.google.com">
                        <div class="option-wrap">
                            <span>官方：https://translate.google.com</span>
                            <span style="margin-left: 10px"> <el-tag type="warning" size="small">国内无法访问</el-tag></span>
                        </div></el-option
                    >
                    <el-option v-for="item in google_proxy_domains" :key="item" :value="item.domain">
                        <div class="option-wrap">
                            <span>镜像：{{ item.domain }}</span>
                            <span style="margin-left: 10px">
                                <span v-if="item.status == 0">
                                    <svg class="loading" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M96 512c0-19.33 15.67-35 35-35s35 15.67 35 35c0 191.09 154.91 346 346 346s346-154.91 346-346-154.91-346-346-346c-19.33 0-35-15.67-35-35s15.67-35 35-35c229.75 0 416 186.25 416 416S741.75 928 512 928 96 741.75 96 512z" fill="#1296db"></path></svg>
                                </span>
                                <el-tag v-if="item.status == -1" type="danger" size="small">失效</el-tag>
                                <el-tag v-if="item.status == 1" type="success" size="small">可用</el-tag>
                            </span>
                        </div>
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import { globalStore } from "@/stores/globalStore";
const childProcess = require("child_process");
export default {
    name: "settings",
    data() {
        return {
            loading: true,
            google_proxy_domains: [
                {
                    domain: "https://translate.amz.wang",
                    status: 0,
                },
                {
                    domain: "https://translate.3822808.com",
                    status: 0,
                },
                {
                    domain: "https://gt.cky.codes",
                    status: 0,
                },
                {
                    domain: "https://gtranslate.cdn.haah.net",
                    status: 0,
                },
            ],
            baidu: {
                appid: this.store.baidu.appid,
                key: this.store.baidu.key,
            },
            google: {
                domain: this.store.google.domain,
            },
        };
    },

    watch: {
        "baidu.appid": function (val) {
            this.store.setBaiduAppId(val);
        },
        "baidu.key": function (val) {
            this.store.setBaiduAppKey(val);
        },
        "google.domain": function (val) {
            this.store.setGoogleDomain(val);
        },
    },
    setup() {
        return { store: globalStore() };
    },
    mounted() {
        this.$http
            .get(`https://raw.githubusercontent.com/ZeeLyn/Translate.Desktop/main/src/google_proxy_domains.json?v=${Date.now()}`, {
                timeout: 20 * 1000,
                $400: null,
                $401: null,
                $403: null,
                $catch: null,
                $error_network: null,
            })
            .then((res) => {
                this.google_proxy_domains = res.data.map((x) => {
                    return {
                        domain: x,
                        status: 0,
                    };
                });
            })
            .catch(() => {})
            .finally(() => {
                this.ping();
                this.loading = false;
            });
    },
    methods: {
        ping() {
            this.google_proxy_domains.forEach((item) => {
                var detail = item;
                childProcess.exec(`ping ${detail.domain.replaceAll("https://", "").replaceAll("http://", "")}`, { maxBuffer: 1024 * 5000 }, (err) => {
                    if (err) {
                        detail.status = -1;
                    } else {
                        detail.status = 1;
                    }
                });
            });
        },
    },
};
</script>
<style scoped>
@keyframes loading {
    0% {
        transform: rotate(0);
    }
    100% {
        transform: rotate(360deg);
    }
}
.option-wrap {
    display: flex;
    align-items: center;
}
.loading {
    animation: loading 1s linear infinite;
    margin-bottom: -5px;
}
</style>
