<template>
    <div class="main">
        <div class="tool-bar">
            <div class="left">
                <div class="logo iconfont icon-translate"></div>
                <b>集成翻译工具</b>
            </div>
            <div class="right">
                <div class="history">
                    <div v-for="item in histroyLanguage" :key="item.code" @click="SelectHistoryHandle(item.code)">{{ item.name }}</div>
                </div>
                <!-- <div class="split">|</div> -->
                <div class="select" tabindex="1">
                    <select v-model="to">
                        <option v-for="item in language" :key="item.code" :value="item.code" :label="item.name" :checked="item.code == to"></option>
                    </select>
                    <!-- <template v-for="item in language" :key="item.code">
                        <input class="selectopt" name="language" type="radio" :id="'opt_' + item.code" :value="item.code" :checked="item.code == to" v-model="to" />
                        <label :for="'opt_' + item.code" class="option">{{ item.name }}</label>
                    </template> -->
                </div>

                <div class="split">|</div>
                <div class="iconfont icon-ontop" title="置顶" @click="SetAlwaysOnTopHandle" :class="alwaysOnTop ? 'always-on-top' : ''"></div>
                <div class="iconfont icon-close" title="关闭" @click="CloseHandle"></div>
            </div>
        </div>
        <div class="wrap">
            <div class="from">
                <textarea rows="20" v-model="query" @input="InputHandle" ref="query"></textarea>
            </div>
            <div class="providers radio-custom">
                <div>
                    <label><input type="radio" name="providers" value="baidu" v-model="provider" :checked="provider == 'baidu'" />百度</label>
                </div>
                <div>
                    <label><input type="radio" name="providers" value="google" v-model="provider" :checked="provider == 'google'" />谷歌</label>
                </div>
            </div>

            <div class="to">
                <div class="trans_wrap">
                    <template v-if="trans_result.result">
                        <div class="item" v-for="(item, idx) in trans_result.result" :key="idx">
                            <div class="src">{{ item.src }}</div>
                            <div class="dst" title="点击复制" @click="ClickTransItemHandle">{{ item.dst }}</div>
                        </div>
                    </template>
                    <div v-if="trans_result.rec" class="rec">
                        <div v-for="item in trans_result.rec" :key="item.atrr">
                            <h4>{{ item.attr }}</h4>
                            <ul>
                                <li v-for="r in item.items" :key="r.src">
                                    <div class="info">
                                        <div @click="ClickTransItemHandle">{{ r.src }}</div>
                                        <span v-for="(k, idx) in r.trans" :key="k">{{ idx > 0 ? "，" : "" }}{{ k }}</span>
                                    </div>
                                    <div class="rate">{{ r.rate }}</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="load-container" v-if="loading">
                    <div class="loader">
                        <div class="loading"></div>
                        <label>拼命加载中...</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import lan from "../utils/lan.js";
import { BaiduTranslate } from "../utils/baidu.js";
import { GoogleTranslate } from "../utils/google.js";
const { ipcRenderer, clipboard } = require("electron");
export default {
    name: "Home",
    components: {},
    watch: {
        provider: function (val) {
            this.TranslateHandle();
            localStorage.setItem("translate-provider", val);
        },
        to: function (val) {
            this.TranslateHandle();
            this.SetHistroyLanguage(val);
            localStorage.setItem("target-language", val);
        },
    },
    data() {
        return {
            loading: false,
            histroyLanguage: [],
            language: lan,
            query: "",
            from: "auto",
            to: "en",
            provider: "baidu",
            alwaysOnTop: false,
            trans_result: {
                result: [],
                rec: [],
            },
        };
    },
    mounted() {
        this.GetHistroyLanguage();
        this.to = localStorage.getItem("target-language") || "en";
        this.provider = localStorage.getItem("translate-provider") || "baidu";
        this.alwaysOnTop = localStorage.getItem("always-on-top") == "true";

        var self = this;
        ipcRenderer.on("OnWindowFocus", () => {
            self.$nextTick(() => {
                if (!self.$refs["query"]) return;
                self.$refs["query"].select();
                self.$refs["query"].focus();
            });
        });
    },
    methods: {
        TranslateHandle() {
            if (!this.query) {
                this.trans_result = {};
                this.loading = false;
                return;
            }
            var self = this;
            this.loading = true;
            switch (this.provider) {
                case "baidu":
                    BaiduTranslate(
                        this.query,
                        this.from,
                        this.to,
                        (res) => {
                            self.trans_result = res;
                        },
                        (err) => {
                            console.error(err);
                        },
                        () => {
                            self.loading = false;
                        }
                    );
                    break;
                case "google":
                    GoogleTranslate(
                        this.query,
                        this.from,
                        this.to,
                        (res) => {
                            this.trans_result = res;
                        },
                        (err) => {
                            console.error(err);
                        },
                        () => {
                            self.loading = false;
                        }
                    );
                    break;
            }
        },
        InputHandle() {
            const self = this;
            clearTimeout(this.timer);
            this.LastTimeInput = Date.now();
            this.timer = setTimeout(() => {
                if (Date.now() - self.LastTimeInput > 1000) {
                    self.TranslateHandle();
                }
                clearTimeout(self.timer);
            }, 1000);
        },
        GetHistroyLanguage() {
            var histroyLanguage = localStorage.getItem("histroyLanguage");
            if (histroyLanguage) {
                this.histroyLanguage = JSON.parse(histroyLanguage).map((item) => {
                    var lan = this.language.find((lan) => lan.code == item);
                    return {
                        code: lan.code,
                        name: lan.name,
                    };
                });
                return JSON.parse(histroyLanguage);
            }
            return [];
        },
        SetHistroyLanguage(lan) {
            var histroyLanguage = this.GetHistroyLanguage();
            var idx = histroyLanguage.findIndex((item) => item == lan);
            if (idx > -1) {
                histroyLanguage.splice(idx, 1);
            }
            histroyLanguage.unshift(lan);
            histroyLanguage = histroyLanguage.slice(0, 2);
            localStorage.setItem("histroyLanguage", JSON.stringify(histroyLanguage));
            this.histroyLanguage = histroyLanguage.map((item) => {
                return this.language.find((lan) => lan.code == item);
            });
        },
        SelectHistoryHandle(lan) {
            this.to = lan;
        },
        SetAlwaysOnTopHandle() {
            this.alwaysOnTop = !this.alwaysOnTop;
            localStorage.setItem("always-on-top", this.alwaysOnTop);
            ipcRenderer.send("SetAlwaysOnTop", this.alwaysOnTop);
        },
        ClickTransItemHandle(e) {
            clipboard.writeText(e.target.innerText);
        },
        CloseHandle() {
            ipcRenderer.send("CloseWindow");
        },
    },
};
</script>
<style scoped>
.rec ul li {
    display: flex;
    margin: 5px 0;
}
.rec h4 {
    color: rgb(89, 255, 227);
    margin-top: 20px;
}
.rec ul li .info {
    flex: 1;
}
.rec ul li .info div {
    margin-right: 15px;
    display: inline-block;
    cursor: pointer;
}
.rec ul li .info div:hover {
    background: #fff;
    color: #292a2d;
}
.main {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #292a2d;
    min-width: 600px;
    min-height: 400px;
}
.tool-bar {
    height: 50px;
    background: #292a2d;
    display: flex;

    border-bottom: 1px #404246 solid;
}
.tool-bar .left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    -webkit-app-region: drag;
    flex: 1;
}
.tool-bar .left b {
    font-size: 15px;
}
.tool-bar .left .logo {
    font-size: 25px;
    color: #fff;
    margin: 0 10px;
}
.tool-bar .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.icon-ontop {
    font-size: 20px;
    margin: 0 10px;
    cursor: pointer;
    color: #595b5f;
}
.icon-close {
    font-size: 20px;
    color: #fff;
    margin: 0 10px;
    cursor: pointer;
}
.split {
    margin: 0 15px;
    color: #595b5f;
}
.always-on-top {
    color: #fff;
}
.history {
    display: flex;
}
.history div {
    margin: 0 10px;
    cursor: pointer;
}
.select {
    background: #404246;
    padding: 0 10px;
    margin-left: 15px;
}

.wrap {
    flex: 1;

    display: flex;
}
.wrap .from,
.wrap .to {
    flex: 1;
    display: flex;
    padding: 15px;
    background: #323336;
    position: relative;
}

.wrap .providers {
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px #404246 solid;
    border-right: 1px #404246 solid;
    flex-shrink: 0;
}
.wrap .providers div {
    display: flex;
    width: 100%;
    align-items: center;
    margin: 10px 0;
    justify-content: center;
    line-height: 16px;
}
.wrap .providers label input {
    margin-right: 5px;
}
textarea {
    outline: none;
    padding: 10px;
    max-width: 100%;
    flex: 1;
    border: none;
    color: #fff;
    background: none;
    resize: none;
    font-size: 16px;
}
.trans_wrap {
    padding: 10px;
    max-width: 100%;
    flex: 1;
    border: none;
    text-align: left;
}
.trans_wrap .item {
    margin: 5px 0;
    display: flex;
}
.trans_wrap .item .src {
    margin-right: 10px;
    flex-shrink: 0;
}
.trans_wrap .item .dst {
    cursor: pointer;
}
.trans_wrap .item .dst:hover {
    background: #fff;
    color: #292a2d;
}
.loading {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
}
.load-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999998;
}
.load-container .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.load-container .loader label {
    font-size: 13px;
    margin-top: 5px;
    color: #fff;
}
.load-container .loading {
    font-size: 10px;
    position: relative;
    border-top: 4px solid rgba(255, 255, 255, 0.2);
    border-right: 4px solid rgba(255, 255, 255, 0.2);
    border-bottom: 4px solid rgba(255, 255, 255, 0.2);
    border-left: 4px solid #ffffff;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: loading 1.1s infinite linear;
    animation: loading 1.1s infinite linear;
    border-radius: 50%;
    width: 35px;
    height: 35px;
}

@-webkit-keyframes loading {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
@keyframes loading {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
</style>
