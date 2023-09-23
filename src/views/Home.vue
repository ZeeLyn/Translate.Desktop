<template>
    <div class="main">
        <div class="tool-bar">
            <div class="left">
                <div class="logo iconfont icon-translate"></div>
                <b>集成翻译工具</b>
            </div>
            <div class="right">
                <div class="history">
                    <el-space wrap>
                        <el-link title="最近使用的语言" class="not-drag" v-for="item in histroyLanguage" :key="item.code" @click="SelectHistoryHandle(item.code)" :type="item.code == to ? 'primary' : 'info'">{{ item.name }}</el-link>
                    </el-space>
                    <!-- <div v-for="item in histroyLanguage" :key="item.code" @click="SelectHistoryHandle(item.code)">{{ item.name }}</div> -->
                </div>

                <!-- <div class="split">|</div> -->
                <!-- <div class="select" tabindex="1"> -->
                <!-- <select v-model="to">
                        <option v-for="item in language" :key="item.code" :value="item.code" :label="item.name" :checked="item.code == to"></option>
                    </select> -->
                <el-select v-model="to" style="width: 180px" size="small" class="not-drag" title="当前翻译的目标语言">
                    <template #prefix> 目标： </template>
                    <el-option v-for="item in language" :key="item.code" :value="item.code" :label="item.name"></el-option>
                </el-select>
                <!-- </div> -->
                <!-- <el-divider direction="vertical" /> -->

                <el-space wrap style="margin-left: 15px">
                    <el-select v-model="provider" style="width: 140px" size="small" class="not-drag" title="使用的翻译平台">
                        <template #prefix> 平台： </template>
                        <el-option label="百度" value="baidu"></el-option>
                        <el-option label="Google" value="google"></el-option>
                    </el-select>
                </el-space>

                <el-divider direction="vertical" />

                <div class="iconfont icon-ontop not-drag" title="置顶" @click="SetAlwaysOnTopHandle" :class="alwaysOnTop ? 'always-on-top' : ''"></div>
                <el-icon title="设置" class="iconfont not-drag" :size="20" @click="settingsVisible = true"><Setting /></el-icon>
                <el-icon title="关闭" class="iconfont not-drag" :size="22" @click="CloseHandle"><CircleCloseFilled /></el-icon>
                <!-- <div class="iconfont icon-close" title="关闭" @click="CloseHandle"></div> -->
            </div>
        </div>
        <div class="wrap">
            <splitpanes>
                <pane min-size="20">
                    <div class="from">
                        <textarea v-model="query" ref="query" autofocus @focus="onFocus" placeholder="请输入要翻译的内容" @input="InputHandle"></textarea>
                        <!-- <el-input class="input-textarea" type="textarea" v-model="query" ref="query" autofocus @focus="onFocus" placeholder="请输入要翻译的内容" clearable resize="none"></el-input> -->
                    </div>
                </pane>
                <pane min-size="20">
                    <div class="to" v-loading="loading" element-loading-text="拼命加载中..." element-loading-background="rgba(0,0,0,0)">
                        <div class="trans_wrap">
                            <div class="socll">
                                <template v-if="trans_result.result && (!trans_result.definitions || trans_result.definitions.length == 0)">
                                    <div class="item" v-for="(item, idx) in trans_result.result" :key="idx">
                                        <div class="src">{{ item.src }}</div>
                                        <el-check-tag checked title="点击复制" @click="ClickTransItemHandle">{{ item.dst }}</el-check-tag>
                                    </div>
                                </template>
                                <div v-if="trans_result.definitions" class="rec">
                                    <div>
                                        <!-- <h4>{{ item.attr }}</h4> -->
                                        <table>
                                            <tr v-for="item in trans_result.definitions" :key="item">
                                                <td>
                                                    <el-check-tag title="点击复制" checked @click="ClickTransItemHandle">{{ item.word }}</el-check-tag>
                                                </td>
                                                <td>{{ item.attr }}</td>
                                                <td>
                                                    <!-- <template v-for="(k, idx) in item.definition" :key="k">
                                                        {{ idx > 0 ? " ," : "" }}
                                                        <span>{{ k }}</span>
                                                    </template> -->
                                                    {{ item.definition }}
                                                </td>
                                            </tr>
                                            <!-- <li v-for="item in trans_result.definitions" :key="item">
                                                <div class="info">
                                                    <div @click="ClickTransItemHandle">{{ item.word }}</div>
                                                    <div>{{ item.attr }}</div>
                                                    <template v-for="(k, idx) in item.definition" :key="k">
                                                        {{ idx > 0 ? " ," : "" }}
                                                        <span>{{ k }}</span>
                                                    </template>
                                                </div>
                                            </li> -->
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </pane>
            </splitpanes>

            <!-- <div class="providers radio-custom">
                <div>
                    <label><input type="radio" name="providers" value="baidu" v-model="provider" :checked="provider == 'baidu'" />百度</label>
                </div>
                <div>
                    <label><input type="radio" name="providers" value="google" v-model="provider" :checked="provider == 'google'" />谷歌</label>
                </div>
            </div> -->
        </div>
    </div>
    <el-dialog class="my-dialog" v-model="settingsVisible" title="设置" width="620px" destroy-on-close append-to-body draggable center> <Settings></Settings></el-dialog>
</template>

<script>
import lan from "../utils/lan.js";
import { BaiduTranslate } from "../utils/baidu.js";
import { GoogleTranslate } from "../utils/google.js";
const { ipcRenderer, clipboard } = require("electron");
import Settings from "../components/Settings.vue";
import { globalStore } from "@/stores/globalStore";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
export default {
    name: "Home",
    components: { Settings, Splitpanes, Pane },
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
            settingsVisible: false,
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
                definitions: [],
            },
        };
    },
    setup() {
        return { store: globalStore() };
    },
    mounted() {
        this.GetHistroyLanguage();
        this.to = localStorage.getItem("target-language") || "en";
        this.provider = localStorage.getItem("translate-provider") || "baidu";
        this.alwaysOnTop = localStorage.getItem("always-on-top") == "true";
        ipcRenderer.send("SetAlwaysOnTop", this.alwaysOnTop);
        var self = this;
        ipcRenderer.on("OnWindowFocus", () => {
            self.$nextTick(() => {
                if (!self.$refs["query"]) {
                    console.warn("refs query is null");
                    return;
                }
                self.$refs["query"].select();
                self.$refs["query"].focus();
            });
        });
        this.LastTimeInput = 0;
        this.TimingTranslate();

        if (!localStorage.getItem("show-tips")) {
            this.$alert("通过快捷键 Ctrl/Command+~ 可快速打开翻译窗口", "提示", {
                center: true,
                confirmButtonText: "我知道了",
            }).then(() => {
                localStorage.setItem("show-tips", 1);
            });
        }
    },
    methods: {
        SuccessCallback(res) {
            this.trans_result = res;
        },
        FailCallback(err) {
            // console.error(err);
            this.$notify.error({
                message: err.code ? err.message : err,
                position: "bottom-right",
            });
        },
        FinallyCallback() {
            this.loading = false;
        },
        TranslateHandle() {
            if (!this.query) {
                this.trans_result = {};
                this.loading = false;
                return;
            }
            this.loading = true;
            switch (this.provider) {
                case "baidu":
                    BaiduTranslate(this.store, this.query, this.from, this.to, this.SuccessCallback, this.FailCallback, this.FinallyCallback);
                    break;
                case "google":
                    GoogleTranslate(this.store, this.query, this.from, this.to, this.SuccessCallback, this.FailCallback, this.FinallyCallback);
                    break;
            }
        },

        InputHandle() {
            this.LastTimeInput = Date.now();
        },

        TimingTranslate() {
            const self = this;
            var _query = "";
            this.timer = setInterval(() => {
                if (_query == self.query || self.loading || Date.now() - self.LastTimeInput < 1300) return;
                _query = self.query;
                self.TranslateHandle();
            }, 200);
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
        onFocus() {
            this.$refs["query"].select();
        },
        ClickTransItemHandle(e) {
            clipboard.writeText(e.target.innerText);
            this.$notify.success({
                message: "已复制到剪切板！",
                position: "bottom-right",
                duration: 2000,
            });
        },
        CloseHandle() {
            ipcRenderer.send("CloseWindow");
        },
        beforeDestroy() {
            clearInterval(this.timer);
        },
    },
};
</script>
<style scoped>
table {
    box-sizing: border-box;
    width: 100%;
}
table td {
    padding: 3px 3px;
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
    height: 40px;
    background: #292a2d;
    display: flex;
    -webkit-app-region: drag;
    border-bottom: 1px #404246 solid;
}

.tool-bar .left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
}

.tool-bar .left b {
    font-size: 13px;
}

.tool-bar .left .logo {
    font-size: 16px;
    color: #1296db;
    margin: 0 5px 0 10px;
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
.tool-bar .right .iconfont {
    margin-right: 10px;
    cursor: pointer;
}

.always-on-top {
    color: #fff;
}

.history {
    display: flex;
    align-items: center;
}

.history div {
    margin: 0 10px;
    cursor: pointer;
}

.wrap {
    flex: 1;

    display: flex;
}

.wrap .from,
.wrap .to {
    width: 100%;
    height: 100%;
    display: flex;
    background: #323336;
    position: relative;
}

textarea {
    font-family: "Microsoft JhengHei UI", Avenir, Helvetica, Arial, sans-serif;
    outline: none;
    padding: 10px;
    max-width: 100%;
    flex: 1;
    border: none;
    color: #fff;
    background: none;
    resize: none;
    font-size: 13px;
    margin-right: 2px;
    line-height: 22px;
}
.trans_wrap .socll::-webkit-scrollbar,
textarea::-webkit-scrollbar {
    width: 3px;
}
.trans_wrap .socll::-webkit-scrollbar-thumb,
textarea::-webkit-scrollbar-thumb {
    background: rgb(125, 124, 124);
    width: 3px;
    border-radius: 2px;
}

.trans_wrap {
    padding: 10px;
    max-width: 100%;
    flex: 1;
    border: none;
    text-align: left;
    position: relative;
}

.trans_wrap .socll {
    position: absolute;
    left: 10px;
    top: 0;
    right: 2px;
    bottom: 0;
    overflow-y: auto;
    padding: 10px 0;
}

.trans_wrap .item {
    padding: 5px 0;
    display: flex;
    align-items: center;
}

/* .trans_wrap .item:hover {
    background: #4c4f53;
} */

.trans_wrap .item .src {
    margin-right: 15px;
    flex-shrink: 0;
    max-width: 45%;
    word-break: break-all;
    font-size: 13px;
    line-height: 22px;
}

.trans_wrap .item .dst {
    cursor: pointer;
    max-width: 50%;
    word-break: break-all;
    font-size: 13px;
    line-height: 22px;
}

.trans_wrap .item .dst:hover {
    background: #fff;
    color: #292a2d;
}
</style>
