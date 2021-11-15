<template>
    <router-view />
    <alert :options="dialog"></alert>
    <loading v-if="showLoading" :msg="msg"></loading>
</template>
<script>
import { getCurrentInstance } from "vue";
import alert from "./components/UI/alert.vue";
import loading from "./components/UI/loading.vue";
export default {
    components: { alert, loading },
    data() {
        return {
            showLoading: false,
            dialog: {},
            msg: "加载中...",
        };
    },
    beforeCreate() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.$showLoading = (_msg) => {
            if (_msg) this.msg = _msg;
            this.showLoading = true;
        };
        app.appContext.config.globalProperties.$hideLoading = () => {
            this.showLoading = false;
        };
        app.appContext.config.globalProperties.$alert = (arg) => {
            this.dialog = arg;
        };
        app.appContext.config.globalProperties.$http.defaults({
            timeout: 10000,
            $400: (err) => {
                this.$alert({
                    title: "提示",
                    content: err.response.data ? err.response.data : err.response.statusText,
                });
            },
            $401: () => {},
            $finally: () => {
                this.$hideLoading();
            },
        });
    },
};
</script>
<style>
* {
    padding: 0;
    margin: 0;
}
#app {
    font-family: "Microsoft JhengHei UI" Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #fff;
    font-size: 16px;
}
@font-face {
    font-family: "iconfont"; /* Project id 2936746 */
    src: url("//at.alicdn.com/t/font_2936746_jzn2qzbasn.woff2?t=1636879308492") format("woff2"), url("//at.alicdn.com/t/font_2936746_jzn2qzbasn.woff?t=1636879308492") format("woff"), url("//at.alicdn.com/t/font_2936746_jzn2qzbasn.ttf?t=1636879308492") format("truetype");
}

.iconfont {
    font-family: "iconfont" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.icon-ontop:before {
    content: "\e697";
}

.icon-dropdown:before {
    content: "\e641";
}

.icon-close:before {
    content: "\e8bb";
}

.icon-translate:before {
    content: "\edd2";
}

body {
    background: #2d2d2d;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    height: 100vh;
    width: 100vw;
    font-family: sans-serif;
    color: #fff;
}
select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: #2d2d2d;
    border: none;
    border-radius: 0;
    color: #fff;
    font-size: 16px;
    margin: 0;
    padding: 10px 23px 10px 0;
    outline: none;
    background: url("~@/assets/dropdown.png") no-repeat right center;
    background-size: 18px auto;
    font-weight: bold;
}
select option {
    background: #2d2d2d;
    color: #fff;
    padding: 5px 0;
}

li {
    list-style: none;
}

/* 
.select {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 40px;
}

.option {
    padding: 0 30px 0 10px;
    min-height: 40px;
    display: flex;
    align-items: center;
    background: #292a2d;
    border-top: #222 solid 1px;
    position: absolute;
    top: 0;
    width: 100%;
    pointer-events: none;
    order: 2;
    z-index: 1;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
}

.option:hover {
    background: #666;
}

.select:focus .option {
    position: relative;
    pointer-events: all;
}

.select input[type="radio"] {
    opacity: 0;
    position: absolute;
    left: -99999px;
}

input[type="radio"]:checked + label {
    order: 1;
    z-index: 2;
    border-top: none;
    position: relative;
}

input[type="radio"]:checked + label:after {
    font-family: "iconfont" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    content: "\e641";
    width: 0;
    height: 0;
    position: absolute;
    right: 20px;
    top: calc(50% - 8px);
    pointer-events: none;
    z-index: 3;
}

input[type="radio"]:checked + label:before {
    position: absolute;
    right: 0;
    height: 40px;
    width: 40px;
    content: "";
} */

.checkbox-custom,
.radio-custom {
    position: relative;
}

.checkbox-custom input[type="checkbox"],
.radio-custom input[type="radio"] {
    margin: auto;
    -webkit-appearance: none;
    background: transparent;
    width: 20px;
    height: 20px;
    border: 1px solid #ccc;
    vertical-align: middle;
    position: relative;
}

.checkbox-custom .radius-50,
.radio-custom .radius-50 {
    border-radius: 50%;
}

.checkbox-custom input[type="checkbox"]:checked,
.radio-custom input[type="radio"]:checked {
    border-color: #ff6435;
    background: #ff6435;
}

.checkbox-custom input[type="checkbox"]:checked:after,
.radio-custom input[type="radio"]:checked:after {
    content: "";
    position: absolute;
    left: 3px;
    top: 4px;
    width: 10px;
    height: 5px;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    -webkit-transform: rotateZ(-45deg);
    transform: rotateZ(-45deg);
}
</style>
