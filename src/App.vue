<template>
	<router-view />
</template>
<script>
import { getCurrentInstance } from "vue";
// import { ElNotification } from "element-plus";
import { globalStore } from "@/stores/globalStore";
// import * as tunnel from "tunnel";
const { ipcRenderer } = require("electron");
import test from "@/test.json";
export default {
	data() {
		return {};
	},
	watch: {
		"store.proxy": {
			deep: true,
			handler: function (v) {
				// this.setHttDefaultOptions();
				// console.log(v);
				ipcRenderer.send("SetProxy", { ...v });
			},
		},
	},
	setup() {
		return { store: globalStore(), app: getCurrentInstance() };
	},

	async mounted() {
		// process.env["HTTPS_PROXY"] = "http://localhost:7890";
		// console.table(process.env);
		this.setHttDefaultOptions();
		var localStorage_baidu_appid = localStorage.getItem("baidu.appid");
		if (localStorage_baidu_appid != null && localStorage_baidu_appid != undefined) this.store.setBaiduAppId(localStorage_baidu_appid);

		var localStorage_baidu_appkey = localStorage.getItem("baidu.key");
		if (localStorage_baidu_appkey != null) this.store.setBaiduAppKey(localStorage_baidu_appkey);

		var localStorage_google_domain = localStorage.getItem("google.domain");
		if (localStorage_google_domain != null) this.store.setGoogleDomain(localStorage_google_domain);

		var proxy = localStorage.getItem("proxy");
		if (proxy) this.store.setProxy(JSON.parse(proxy));

		const dict = test.dict?.map((x) => {
			return { ...x.entry };
		});
		console.log(dict);
	},
	methods: {
		setHttDefaultOptions() {
			this.app.appContext.config.globalProperties.$http.defaults((config) => {
				config.timeout = 10 * 1000;
				config.$on_before_request = () => {
					//options.headers["Authorization"] = "Bearer " + localStorage.getItem("access_token");
				};

				config.$error_network = (err) => {
					console.error("network error ", err);
				};

				if (this.store.proxy && this.store.proxy.host && this.store.proxy.port && this.store.proxy.enable) {
					// config.proxy = {
					//     protocol: "https",
					//     host: this.store.proxy.host,
					//     port: this.store.proxy.port,
					// };
					console.log("开启代理", this.store.proxy);
					// const agent = tunnel.httpsOverHttp({
					//     proxy: {
					//         host: this.store.proxy.host,
					//         port: this.store.proxy.port,
					//     },
					// });
					// config.httpsAgent = agent;
					// config.proxy = true;
				} else {
					console.log("关闭代理");
					// config.httpsAgent = null;
					config.proxy = null;
				}
			});
		},
	},
};
</script>
<style>
* {
	padding: 0;
	margin: 0;
}
#app {
	font-family: "Microsoft JhengHei UI", Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #fff;
	font-size: 13px;
}
@font-face {
	font-family: "iconfont";
	src: url("data:font/woff2;charset=utf-8;base64,d09GMgABAAAAAARYAA0AAAAACPQAAAQBAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGh4GYACCUhEICoU4hEALDgABNgIkAxQEIAWFAgdEG4cHyB4F7twQ5yOXYzNcX+zx8I+d9PfNTOKl8KW1qy8mXXbyqRI6vVjCKNWNFZfufREvlSr+xJr4l9JAIx7xaETSh99fHvj+BESqHThYJzZ4ABrYIMQtbuia/AV+IF/8brloPvBFWYZGimz4NM2gKIG0gc0GNvOh9IA7E3HKw1wI+PiRSTj4+pk8kds3oYmBIBFSJSFDgiwTtyuRnE7ewm3A9eNPc6NKopTi5j//SFop7P7LfX9/kLaKFulX2gjAgxiNkCLFcATOxgoMx5kNqqoSfrnvtxf+/qAo2BpDKvssq+jSrFEm2DoSJOCnJwAHHUUhAWXQRBW/ECMBZAAIidLSIcPT3v37rtwK8qd09jSqSmc/d9foToDuGTB1NO3xJWenB4fs56DuFMoMK2DaT2IHHnnW4fziIcbrxXeDfCCVrCjKqZ98goP21k8/Bd1LPv4YtC7+6KOt79mikkyzbClkBWtGak+jKKVzbDsqTc2eldjkQFuOd6tAM39P1nq/0as7SF1elBqgQylUKvsctVppy1AqiqbN7g+9V23velVawtPhemdwtJn3h9/tkka075MqYRrde1gKUL9/+nzIQpySZcMCkQ/cjp+2oWgDFOOgnvdXwC65B+rR/TBK7Q9e6A/vtWGaZPLn+us1gTWxie4+wzqY1r7Xtq5veN0R664864x3u/Tyg87mTuSw+Q99Lm2/7F3bMPF31M5uPtT76Z5r35+6D1bcdCzfP8dPLvfL8c8/h81+OZw5Z6I38znZoCLm8sM3x3W8N690ywcvouojMKxvCP+8sX0677jUd9y8M0y2TJsNFssX1Yk9PK4AU25uH5FT55bjt3G4a3xZlN1HH5WPzLU5lcT8e/i+wknZrcXrGXnfbZlF9xXk3O3Yw+Se2/5P5uFO9xbj5j2Ivb/XA5VF5zHr/j/F+p7rKw31sZdIZx8mX6bBXFttflTZMs908pEsk6PV3T4MBIJVW2KIBebL/6k2MtPGeChambSFqgQEQ13BrgxkuBdkmfE/kXE3CJRdhQcJ6uooAPT1FIB+DARC1bkIJCqOIpCqaguQqXpYgJKGlwQoq/pSgLppsRyBhn5xu1RkNUwEkgy9HchET1vJVG8tkhFXsmSgG1nW24Os2+LfrGFiHHM0iPkmjh0RBHZuLtRqJEUTPGLwiwm/2GWApVAFd8WFYqlZxTfAv+qiTR49yN0iNhjlvgKHyYZdbvWRM2dnRTZZGtnD93GR0SLlmkwSgsSgVRNcirhHrFJpCTqDViEWmpjwQOLc0l4R1dpavi/mXwPzm1P5v8kQhmPlK+t4LJakZGgK6zTg0GI4kpmf91XLSDbqWJMyQhJJpJGVssGGRvTSm4T/Qg8AAAA=") format("woff2"), url("data:font/woff;charset=utf-8;base64,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") format("woff");
	font-weight: normal;
	font-style: normal;
	font-display: swap;
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
	color: #fff;
}

li {
	list-style: none;
}

.my-dialog .el-dialog__body {
	padding: 10px 15px !important;
}
.splitpanes__splitter {
	width: 5px !important;
	background-color: #404246;
	background-image: url("~@/assets/dot.png");
	background-size: 11px auto;
	background-position: center;
	background-repeat: no-repeat;
}
.not-drag {
	-webkit-app-region: no-drag;
}

.el-check-tag {
	font-weight: normal !important;
	font-size: 13px !important;
	line-height: 18px !important;
}
</style>
