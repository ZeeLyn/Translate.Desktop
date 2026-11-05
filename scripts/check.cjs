const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { EventEmitter } = require("events");
const babel = require("@babel/core");

function load(file, mocks, globals = {}) {
    let source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    if (file.endsWith(".vue")) source = require("@vue/compiler-sfc").parse(source).descriptor.script.content;
    const { code } = babel.transformSync(source, {
        babelrc: false,
        configFile: false,
        plugins: ["@babel/plugin-transform-modules-commonjs"],
    });
    const exports = {};
    vm.runInNewContext(code, {
        exports,
        require: (name) => Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : require(name),
        process: { env: { NODE_ENV: "production" }, platform: "darwin" },
        __dirname,
        console,
        URL,
        URLSearchParams,
        AbortSignal,
        setTimeout,
        ...globals,
    }, { filename: file });
    return exports;
}

async function checkLifecycle() {
    const app = new EventEmitter();
    Object.assign(app, {
        requestSingleInstanceLock: () => true,
        setLoginItemSettings() {},
        dock: { hide() {} },
    });
    let window;
    class BrowserWindow extends EventEmitter {
        constructor() {
            super();
            window = this;
            this.visible = false;
            this.webContents = { send() {} };
        }
        loadURL() { return Promise.resolve(); }
        show() { this.visible = true; }
        hide() { this.visible = false; }
        setSkipTaskbar(value) { this.skipTaskbar = value; }
        static getAllWindows() { return window ? [window] : []; }
    }
    class Tray extends EventEmitter {
        setToolTip() {}
        setContextMenu() {}
    }
    let unregistered = false;
    load("src/background.js", {
        electron: {
            app, BrowserWindow, Tray,
            protocol: { registerSchemesAsPrivileged() {} },
            ipcMain: { on() {}, handle() {} },
            nativeImage: { createFromPath() {} },
            Menu: { buildFromTemplate: (items) => items },
            globalShortcut: { register() {}, unregisterAll() { unregistered = true; } },
        },
        "vue-cli-plugin-electron-builder/lib": { createProtocol() {} },
        "electron-devtools-installer": {},
        "./utils/http": {},
        "./utils/googleClient": {},
    });
    app.emit("ready");
    let prevented = false;
    window.emit("close", { preventDefault() { prevented = true; } });
    assert(prevented, "Closing the window should hide it");
    assert(!window.visible);
    app.emit("activate");
    assert(window.visible, "macOS activation should reopen the hidden window");
    assert.strictEqual(window.skipTaskbar, false);
    app.emit("before-quit");
    window.emit("close", { preventDefault() { assert.fail("Quitting must not be cancelled"); } });
    app.emit("will-quit");
    assert(unregistered, "Quitting should unregister shortcuts");
}

async function checkMirrors() {
    const requests = [];
    const settings = load("src/components/Settings.vue", {
        "@/stores/globalStore": {},
        electron: { ipcRenderer: { async invoke(channel, url, config) {
            requests.push(url);
            assert.strictEqual(channel, "$HttpGet");
            assert.strictEqual(config.timeout, 5000);
            assert.strictEqual(config.params.q, "hello");
            if (url.includes("offline")) throw new Error("timeout");
            return url.includes("html") ? "<html>not a translator</html>" : [[["你好"]]];
        } } },
    }).default;
    const domains = ["https://working.example", "https://offline.example", "https://html.example", "http://insecure.example", "invalid; command"];
    const state = { google_proxy_domains: domains.map(domain => ({ domain, status: 0 })) };
    await settings.methods.ping.call(state);
    assert.deepStrictEqual(state.google_proxy_domains.map(item => item.status), [1, -1, -1, -1, -1]);
    assert.strictEqual(requests.length, 3, "Invalid URLs must not be requested");
}

async function checkBaidu() {
    let called = false;
    const { BaiduTranslate } = load("src/utils/baidu.js", {
        electron: { ipcRenderer: { invoke(channel, url, config) {
            called = true;
            assert.strictEqual(channel, "$HttpGet");
            assert.strictEqual(url, "https://fanyi-api.baidu.com/api/trans/vip/translate");
            assert.strictEqual(config.params.q, "hello");
            return Promise.resolve({ trans_result: [{ src: "hello", dst: "你好" }] });
        } } },
    });
    await new Promise((resolve, reject) => {
        BaiduTranslate({ baidu: { appid: "test", key: "test" } }, "hello", "auto", "zh", (res) => {
            assert.strictEqual(res.result[0].dst, "你好");
        }, reject, resolve);
    });
    assert(called);
    let failed = false;
    let finished = false;
    BaiduTranslate({ baidu: {} }, "hello", "auto", "zh", () => assert.fail("Missing credentials"), () => { failed = true; }, () => { finished = true; });
    assert(failed && finished, "Missing credentials must report an error and finish");
}

async function checkHttp() {
    const calls = [];
    const client = load("src/utils/http.js", {
        axios: { request(config) { calls.push(config); return Promise.resolve({ data: "ok" }); } },
    });
    client.setProxy({ enable: true, host: " http://127.0.0.1 ", port: "7890" });
    await client.request({ url: "https://example.com" });
    assert.strictEqual(calls[0].proxy, false, "Environment proxies must not override the configured tunnel");
    assert.strictEqual(calls[0].httpAgent.proxyOptions.port, 7890);
    assert.strictEqual(calls[0].httpsAgent.proxyOptions.host, "127.0.0.1");
    assert(calls[0].signal, "The CONNECT handshake also needs a timeout");
    for (const config of [{ host: "", port: 7890 }, { host: "localhost", port: "abc" }, { host: "socks5://localhost", port: 1080 }, { host: "localhost", port: 65536 }]) {
        client.setProxy({ enable: true, ...config });
        assert.throws(() => client.request({ url: "https://example.com" }), /代理/);
    }
    client.setProxy({ enable: false });
    await client.request({ url: "https://example.com" });
    assert.strictEqual(calls[1].httpsAgent, undefined);
    assert.throws(() => client.request({ url: "file:///secret" }), /HTTP/);

    const http = require("http");
    const https = require("https");
    const net = require("net");
    const certificate = require("selfsigned").generate([{ name: "commonName", value: "localhost" }], {
        keySize: 2048,
        days: 1,
        extensions: [{ name: "subjectAltName", altNames: [{ type: 7, ip: "127.0.0.1" }] }],
    });
    const sockets = new Set();
    const target = http.createServer((req, res) => res.end("through-proxy"));
    const secureTarget = https.createServer({ key: certificate.private, cert: certificate.cert }, (req, res) => res.end("secure-through-proxy"));
    const proxy = http.createServer();
    let connections = 0;
    let hang = false;
    proxy.on("connect", (req, socket, head) => {
        connections++;
        if (hang) return;
        const [host, port] = req.url.split(":");
        const upstream = net.connect(Number(port), host, () => {
            socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
            upstream.write(head);
            socket.pipe(upstream).pipe(socket);
        });
        sockets.add(upstream);
        upstream.on("error", () => socket.destroy());
        socket.on("close", () => upstream.destroy());
    });
    for (const server of [target, secureTarget, proxy]) {
        server.on("connection", socket => sockets.add(socket));
        await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    }
    const realClient = load("src/utils/http.js", {
        axios: { request(config) {
            // Only trust the local test certificate; production TLS verification stays enabled.
            if (config.httpsAgent) config.httpsAgent.options.ca = certificate.cert;
            else config.httpsAgent = new https.Agent({ ca: certificate.cert });
            return require("axios").request(config);
        } },
    });
    const targetUrl = `http://127.0.0.1:${target.address().port}/`;
    try {
        realClient.setProxy({ enable: true, host: "127.0.0.1", port: proxy.address().port });
        assert.strictEqual((await realClient.request({ url: targetUrl })).data, "through-proxy");
        assert.strictEqual(connections, 1, "The request must actually reach the proxy");
        const secureUrl = `https://127.0.0.1:${secureTarget.address().port}/`;
        assert.strictEqual((await realClient.request({ url: secureUrl })).data, "secure-through-proxy");
        assert.strictEqual(connections, 2, "HTTPS must use CONNECT through the same proxy");
        realClient.setProxy({ enable: false });
        await realClient.request({ url: targetUrl });
        assert.strictEqual(connections, 2, "Disabled proxy must use a direct connection");
        realClient.setProxy({ enable: true, host: "127.0.0.1", port: proxy.address().port });
        hang = true;
        await assert.rejects(realClient.request({ url: targetUrl, timeout: 100 }), /cancel|timeout/i);
    } finally {
        for (const socket of sockets) socket.destroy();
        await Promise.all([target, secureTarget, proxy].map(server => new Promise(resolve => server.close(resolve))));
    }
}

async function checkGoogle() {
    let now = 1000000000;
    let responseError;
    let invalidResponse = false;
    const calls = [];
    const { translateGoogle } = load("src/utils/googleClient.js", {
        "./http": {
            async request(config) {
                calls.push({ ...config, started: now });
                if (responseError) throw responseError;
                return { data: invalidResponse ? "<html>verification</html>" : { sentences: [{ orig: new URLSearchParams(config.data).get("q"), trans: "译文" }] } };
            },
            requestError: error => error,
        },
    }, { Date: { now: () => now, parse: Date.parse }, setTimeout: (callback, ms) => { now += ms; callback(); } });
    const translate = query => translateGoogle("https://translate.google.com", query, "auto", "jp", "TranslateDesktop test browser");
    const first = translate("hello");
    assert.strictEqual(first, translate("hello"), "Duplicate in-flight requests should share one request");
    assert.strictEqual((await first).result[0].dst, "译文");
    await translate("hello");
    assert.strictEqual(calls.length, 1, "Repeated translations should use memory cache");
    assert.strictEqual(calls[0].params.tl, "ja");
    assert.strictEqual(calls[0].headers["User-Agent"], "TranslateDesktop test browser");
    assert.strictEqual(calls[0].headers.Origin, "https://translate.google.com");
    await translate("second");
    assert(calls[1].started - calls[0].started >= 2000, "Google calls need a minimum interval");
    const obsolete = translate("obsolete");
    const latest = translate("latest");
    assert.strictEqual(await obsolete, null);
    await latest;
    assert(!calls.some(call => new URLSearchParams(call.data).get("q") === "obsolete"), "Obsolete queued text must not be requested");
    now += 600001;
    await translate("hello");
    assert.strictEqual(calls.filter(call => new URLSearchParams(call.data).get("q") === "hello").length, 2, "Cache should expire");
    responseError = { response: { status: 429, headers: { "retry-after": "120" } } };
    await assert.rejects(translate("limited"), /120 秒/);
    const before = calls.length;
    await assert.rejects(translate("cooldown"), /请求频繁/);
    assert.strictEqual(calls.length, before, "Cooldown must not send another request");
    now += 120001;
    responseError = undefined;
    await translate("recovered");
    invalidResponse = true;
    await assert.rejects(translate("invalid"), /官方网页版/);
    responseError = { response: { status: 403 } };
    await assert.rejects(translate("forbidden"), /拒绝访问/);
    await assert.rejects(translate(" "), /翻译内容/);
}

function checkSavedProxy() {
    const sent = [];
    const store = { proxy: { enable: false }, setProxy(value) { this.proxy = value; } };
    let saved = JSON.stringify({ enable: true, host: "127.0.0.1", port: 7890 });
    const app = load("src/App.vue", {
        "@/stores/globalStore": {},
        electron: { ipcRenderer: { send(channel, config) { sent.push([channel, config]); } } },
    }, {
        localStorage: { getItem: key => key === "proxy" ? saved : null },
        console: { warn() {} },
    }).default;
    app.created.call({ store });
    assert.strictEqual(sent[0][0], "SetProxy");
    assert.strictEqual(sent[0][1].port, 7890, "Saved proxy must be sent before children mount");
    saved = "broken JSON";
    assert.doesNotThrow(() => app.created.call({ store }));
}

function checkLatestTranslation() {
    const requests = [];
    const home = load("src/views/Home.vue", {
        "../utils/lan.js": [],
        "../utils/baidu.js": { BaiduTranslate(...args) { requests.push(args); } },
        "../utils/google.js": {},
        "../components/Settings.vue": {},
        "@/stores/globalStore": {},
        "splitpanes": {},
        "splitpanes/dist/splitpanes.css": {},
        "@vueuse/core": {},
        electron: {},
    }).default;
    const state = { ...home.data(), ...home.methods, store: {}, provider: "baidu", query: "first" };
    state.TranslateHandle();
    state.query = "second";
    state.TranslateHandle();
    requests[0][4]({ result: ["old"] });
    requests[0][6]();
    assert(state.loading, "An old request must not clear the latest loading state");
    requests[1][4]({ result: ["new"] });
    requests[1][6]();
    assert.strictEqual(state.trans_result.result[0], "new");
    assert(!state.loading);
}

async function checkMacBuildConfig() {
    const builderPath = require.resolve("electron-builder");
    require(builderPath);
    const originalBuilder = require.cache[builderPath].exports;
    const commands = {};
    let options;
    require.cache[builderPath].exports = { build(value) { options = value; return Promise.resolve(); } };
    try {
        require("vue-cli-plugin-electron-builder")({
            hasPlugin: () => false,
            chainWebpack() {},
            registerCommand(name, description, handler) { commands[name] = handler; },
        }, require("../vue.config.js"));
        const script = require("../package.json").scripts["electron:build:mac:arm64"];
        const args = script.split(" -- ")[1].trim().split(/\s+/);
        await commands["electron:build"]({ skipBundle: true }, args);
        assert.strictEqual(options.config.directories.app, "dist_electron/bundled", "CLI signing options must not replace the bundled app configuration");
        assert.strictEqual(options.config.productName, "Translate Desktop");
        assert.strictEqual(options.config.mac.identity, "-");
        assert.strictEqual(options.config.mac.hardenedRuntime, false);
        assert(options.arm64);
    } finally {
        require.cache[builderPath].exports = originalBuilder;
    }
}

(async () => {
    await checkLifecycle();
    await checkMirrors();
    await checkBaidu();
    await checkHttp();
    await checkGoogle();
    checkSavedProxy();
    checkLatestTranslation();
    await checkMacBuildConfig();
    console.log("Passed: macOS lifecycle, mirror checks, Baidu HTTPS, proxy routing, Google caching/rate limits, stale responses, macOS build config");
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
