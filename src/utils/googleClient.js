import { request, requestError } from "./http";

const cache = new Map();
const pending = new Map();
let queue = Promise.resolve();
let latestKey = "";
let lastStarted = 0;
let cooldownUntil = 0;
const languageCodes = { zh: "zh-CN", cht: "zh-TW", jp: "ja", kor: "ko", fra: "fr", spa: "es", ara: "ar", bul: "bg", est: "et", vie: "vi", slo: "sl", rom: "ro" };

function cooldownError() {
    return new Error(`Google 请求频繁，请在 ${Math.ceil((cooldownUntil - Date.now()) / 1000)} 秒后再试；也可稍后使用官方网页版或切换百度翻译`);
}

export function translateGoogle(domain, query, from, to, userAgent = "TranslateDesktop") {
    if (typeof query !== "string" || !query.trim() || query.length > 5000) return Promise.reject(new Error("请输入 1–5000 字符的翻译内容"));
    const url = new URL("/translate_a/single", domain);
    if (url.protocol !== "https:") return Promise.reject(new Error("Google 翻译地址必须使用 HTTPS"));
    if (from === "wyw" || to === "wyw") return Promise.reject(new Error("Google 不支持文言文，请切换百度翻译"));
    from = languageCodes[from] || from;
    to = languageCodes[to] || to;
    const key = JSON.stringify([url.origin, query, from, to]);
    latestKey = key;
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) return Promise.resolve(cached.value);
    if (pending.has(key)) return pending.get(key);
    if (Date.now() < cooldownUntil) return Promise.reject(cooldownError());

    const task = queue.then(async () => {
        if (key !== latestKey) return null;
        const wait = Math.max(0, lastStarted + 2000 - Date.now());
        if (wait) await new Promise(resolve => setTimeout(resolve, wait));
        if (key !== latestKey) return null;
        if (Date.now() < cooldownUntil) throw cooldownError();
        lastStarted = Date.now();
        try {
            // shortcut: 此为未公开的翻译端点，需要稳定配额时改用 Cloud Translation API。
            const { data } = await request({
                method: "post", url: url.href,
                params: { client: "gtx", sl: from, tl: to, dt: ["t", "bd"], dj: 1 },
                paramsSerializer: { indexes: null },
                data: new URLSearchParams({ q: query }).toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                    "User-Agent": userAgent,
                    Origin: url.origin,
                    Referer: `${url.origin}/`,
                },
            });
            if (!data || !Array.isArray(data.sentences)) throw new Error("Google 返回内容异常，请在官方网页版检查是否需要验证");
            const result = data.sentences.filter(item => item && typeof item.trans === "string").map(item => ({ src: item.orig, dst: item.trans }));
            if (!result.length) throw new Error("Google 未返回翻译结果");
            const dict = (Array.isArray(data.dict) ? data.dict : []).flatMap(item => (Array.isArray(item.entry) ? item.entry : []).map(entry => ({ word: entry.word, trans: entry.reverse_translation, score: entry.score || 0 })));
            const value = { result, dict };
            if (cache.size >= 100) cache.delete(cache.keys().next().value);
            cache.set(key, { value, expires: Date.now() + 10 * 60 * 1000 });
            return value;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                const retryAfter = error.response.headers && error.response.headers["retry-after"];
                const seconds = Number(retryAfter);
                const retryAt = Number.isFinite(seconds) ? Date.now() + seconds * 1000 : Date.parse(retryAfter);
                cooldownUntil = Math.max(Date.now() + 60000, retryAt || 0);
                throw cooldownError();
            }
            if (error.response && error.response.status === 403) throw new Error("Google 拒绝访问，请在官方网页版检查网络或验证状态，或切换百度翻译");
            throw requestError(error);
        }
    });
    pending.set(key, task);
    queue = task.catch(() => {});
    task.then(() => pending.delete(key), () => pending.delete(key));
    return task;
}
