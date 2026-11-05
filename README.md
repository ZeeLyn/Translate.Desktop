# Translate Desktop

根据个人使用习惯制作的翻译工具，喜欢可以[下载](https://github.com/ZeeLyn/Translate.Desktop/releases)安装。您也可以下载源码自己修改。

## Apple Silicon 安装包

支持搭载 Apple 芯片的 Mac（arm64）。DMG 构建及签名需要在 macOS 上进行；Windows 用户可以使用下面的 GitHub Actions 流程。

### 在 Mac 上打包

使用 Node.js 22.23.4。项目沿用 Vue CLI 4，构建脚本已加上所需的 OpenSSL 兼容参数；electron-builder 固定为 26.18.0。安装 Node.js 后运行：

```sh
npm ci
npm test
npm run electron:build:mac:arm64
```

产物位于 `dist_electron/`：

- `Translate Desktop-3.1.0-mac-arm64.dmg`：打开后将应用拖入「应用程序」。
- `Translate Desktop-3.1.0-mac-arm64.zip`：包含同一个 arm64 应用。

文件名中的版本号随 `package.json` 更新。构建命令使用 ad-hoc 签名，不需要开发者证书，也不会自动发布 Release。它不包含 Apple 公证，首次打开可能被 Gatekeeper 拦截；确认来源后，在「系统设置 → 隐私与安全性」中允许打开。

### 使用 GitHub Actions 打包

将代码推送到 GitHub 后，在仓库 **Actions → macOS Apple Silicon → Run workflow** 中启动构建。完成后，从该次运行的 **Artifacts → Translate-Desktop-mac-arm64** 下载 DMG 和 ZIP。

推送到 `codex/macos-arm64-proxy` 分支也会自动触发同一构建流程。

流程使用 macOS arm64 构建机，运行 lint 和回归检查，并验证应用架构、代码签名及 DMG。它只保存构建产物，不发布 Release。

正式公开分发时，需要提供 Developer ID 证书和 Apple 公证凭据，并移除构建命令中的 `--config.mac.identity=-` 和 `--config.mac.hardenedRuntime=false`，改用证书签名及 Hardened Runtime。当前 Electron 25 已结束维护，正式发布前应另行升级并做兼容性验证。

## 代理与 Google 访问频率

在「设置 → 网络」启用代理，填写代理软件的 **HTTP/Mixed 地址与端口**，例如 `127.0.0.1` 和 `7890`，然后点击「测试 Google 连接」。这里不支持 SOCKS 端口，也不会自动读取系统代理。连接检测成功只代表 Google 网页可达，不保证翻译端点没有受到限制。

百度、Google、镜像列表和手动镜像检测统一经过主进程的请求库。启用代理时 HTTP 和 HTTPS 都使用该代理；代理错误会报错，关闭代理后直连，环境变量中的代理不会覆盖应用设置。

Google 翻译在停止输入 1 秒后请求，两次请求至少间隔 2 秒；相同的进行中请求会合并，成功结果在内存缓存 10 分钟（最多 100 条，退出后清空）。过时的排队请求会跳过，旧结果不会覆盖新文本。镜像可用性改为手动检测，避免每次打开设置都请求翻译端点。

收到 HTTP 429 时暂停请求至少 60 秒，并尊重服务端更长的 `Retry-After`；不会自动重试。HTTP 403 或验证页面会给出提示。代理出口 IP 仍可能受到 Google 限制。

请求携带应用自带 Chromium 的 User-Agent，以及对应域名的 Origin/Referer，文本通过表单 POST 发送。当前使用未公开的 `translate_a/single` 端点（`client=gtx`），它不是官方网页版的完整浏览器会话，也没有稳定性或配额保证。需要长期稳定调用时，应使用 [Cloud Translation API](https://cloud.google.com/translate)。
