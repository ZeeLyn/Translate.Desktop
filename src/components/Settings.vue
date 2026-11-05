<template>
    <div>
        <el-tabs>
            <el-tab-pane label="翻译">
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
                                        <el-tag v-if="item.status == 0" type="info" size="small">未检测</el-tag>
                                        <el-tag v-if="item.status == -1" type="danger" size="small">失效</el-tag>
                                        <el-tag v-if="item.status == 1" type="success" size="small">可用</el-tag>
                                    </span>
                                </div>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="checkingMirrors" @click="ping">检测镜像</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="网络">
                <el-form label-width="auto">
                    <el-form-item label="代理">
                        <el-switch v-model="proxy.enable"></el-switch>
                    </el-form-item>
                    <el-alert type="info" :closable="false" style="margin-bottom: 10px">填写代理软件的 HTTP/Mixed 端口，支持 HTTP 和 HTTPS 请求；启用后连接失败会报错。</el-alert>
                    <el-form-item label="地址">
                        <el-input v-model="proxy.host" placeholder="例如 127.0.0.1" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="端口">
                        <el-input v-model="proxy.port" placeholder="请输入代理服务器端口号" clearable type="number"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="testingProxy" @click="testProxy">测试 Google 连接</el-button>
                    </el-form-item>
                    <el-alert v-if="proxyTestResult" :title="proxyTestResult" :type="proxyTestSuccess ? 'success' : 'error'" :closable="false"></el-alert>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import { globalStore } from "@/stores/globalStore";
const { ipcRenderer } = require("electron");
export default {
    name: "settings",
    data() {
        return {
            loading: true,
            checkingMirrors: false,
            testingProxy: false,
            proxyTestResult: "",
            proxyTestSuccess: false,
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
            proxy: this.store.proxy,
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
        proxy: {
            deep: true,
            handler: function (v) {
                this.store.setProxy(v);
                this.proxyTestResult = "";
            },
        },
    },
    setup() {
        return { store: globalStore() };
    },
    mounted() {
        ipcRenderer
            .invoke("$HttpGet", `https://raw.githubusercontent.com/ZeeLyn/Translate.Desktop/main/src/google_proxy_domains.json?v=${Date.now()}`, {
                timeout: 10000,
            })
            .then((res) => {
                if (!Array.isArray(res)) throw new Error("镜像列表格式错误");
                this.google_proxy_domains = res.filter(x => typeof x === "string").map((x) => {
                    return {
                        domain: x,
                        status: 0,
                    };
                });
            })
            .catch(() => {})
            .finally(() => {
                this.loading = false;
            });
    },
    methods: {
        async testProxy() {
            this.testingProxy = true;
            this.proxyTestResult = "";
            ipcRenderer.send("SetProxy", { ...this.proxy });
            try {
                await ipcRenderer.invoke("$HttpGet", "https://translate.google.com/", { timeout: 10000 });
                this.proxyTestSuccess = true;
                this.proxyTestResult = this.proxy.enable ? "Google 连接成功（通过配置的 HTTP 代理）" : "Google 直连成功（代理未启用）";
            } catch (error) {
                this.proxyTestSuccess = false;
                this.proxyTestResult = error.message;
            } finally {
                this.testingProxy = false;
            }
        },
        async ping() {
            this.checkingMirrors = true;
            await Promise.all(this.google_proxy_domains.map(async (item) => {
                try {
                    const url = new URL(item.domain);
                    if (url.protocol !== "https:") throw new Error("镜像必须使用 HTTPS");
                    url.pathname = "/translate_a/single";
                    const res = await ipcRenderer.invoke("$HttpGet", url.href, {
                        timeout: 5000,
                        params: { client: "gtx", sl: "en", tl: "zh-CN", dt: "t", q: "hello" },
                    });
                    item.status = Array.isArray(res?.[0]?.[0]) && typeof res[0][0][0] === "string" ? 1 : -1;
                } catch {
                    item.status = -1;
                }
            }));
            this.checkingMirrors = false;
        },
    },
};
</script>
<style scoped>
.option-wrap {
    display: flex;
    align-items: center;
}
</style>
