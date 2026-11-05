import axios from "axios";
import * as tunnel from "tunnel";

let proxyConfig = { enable: false };

export function setProxy(config) {
    proxyConfig = { ...config };
}

export function request(config) {
    const url = new URL(config.url);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("只支持 HTTP/HTTPS 请求");
    const options = { timeout: 10000, ...config, proxy: false, httpAgent: undefined, httpsAgent: undefined };
    if (proxyConfig.enable) {
        const host = String(proxyConfig.host || "").trim();
        if (!host) throw new Error("请填写 HTTP 代理地址");
        const endpoint = new URL(host.includes("://") ? host : `http://${host}`);
        const port = Number(proxyConfig.port || endpoint.port);
        if (endpoint.protocol !== "http:" || endpoint.username || endpoint.password || endpoint.pathname !== "/" || endpoint.search || endpoint.hash) {
            throw new Error("请使用 HTTP/Mixed 代理地址，例如 127.0.0.1；不支持 SOCKS 端口");
        }
        if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("代理端口必须为 1–65535");
        const proxy = { host: endpoint.hostname.replace(/^\[|\]$/g, ""), port };
        options.httpAgent = tunnel.httpOverHttp({ proxy });
        options.httpsAgent = tunnel.httpsOverHttp({ proxy });
    }
    options.signal = AbortSignal.timeout(options.timeout);
    return axios.request(options);
}

export function requestError(error) {
    const status = error.response && error.response.status;
    return new Error(status ? `HTTP ${status}：${error.message}` : `网络请求失败：${error.message}，请检查网络和代理设置`);
}
