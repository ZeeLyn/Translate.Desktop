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
            <el-form-item>
                <div style="text-align: center; width: 100%">
                    <el-button type="danger" @click="ResetBiaduHandle">重置为默认百度APP ID</el-button>
                </div>
            </el-form-item>
            <el-divider> Google翻译 </el-divider>
            <el-form-item label="域名">
                <el-select v-model="google.domain" style="width: 100%">
                    <el-option label="官方：https://translate.google.com" value="https://translate.google.com" />
                    <el-option label="镜像：https://translate.amz.wang" value="https://translate.amz.wang" />
                    <el-option label="镜像：https://translate.3822808.com" value="https://translate.3822808.com" />
                </el-select>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import { globalStore } from "@/stores/globalStore";
export default {
    name: "settings",
    data() {
        return {
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
    methods: {
        ResetBiaduHandle() {
            this.$confirm("确定要重置吗？", "提示").then(() => {
                this.baidu.appid = this.store.defBiadu.appid;
                this.baidu.key = this.store.defBiadu.key;
            });
        },
    },
};
</script>
