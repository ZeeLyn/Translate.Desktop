# Translate Desktop

根据个人使用习惯制作的翻译工具，喜欢可以[下载](https://github.com/ZeeLyn/Translate.Desktop/releases)安装。您也可以下载源码自己修改。

## 安装包

从 [Releases](https://github.com/ZeeLyn/Translate.Desktop/releases) 下载与你的系统和 CPU 对应的文件：

| 系统 | CPU | 文件名标记 |
| --- | --- | --- |
| Windows | Intel / AMD 64 位 | `win-x64-setup.exe` |
| Windows | Intel / AMD 32 位 | `win-ia32-setup.exe` |
| Windows | ARM64 | `win-arm64-setup.exe` |
| macOS | Intel | `mac-x64.dmg` / `.zip` |
| macOS | Apple Silicon | `mac-arm64.dmg` / `.zip` |
| Linux | Intel / AMD 64 位 | `linux-x86_64.AppImage` / `linux-amd64.deb` |
| Linux | ARM64 | `linux-arm64.AppImage` / `.deb` |

例如 `Translate-Desktop-3.1.1-mac-arm64.dmg`。DMG 打开后将应用拖入「应用程序」；Windows 运行 EXE 安装；Linux 可安装 DEB，或为 AppImage 添加执行权限后运行。Release 文件名中的空格统一为连字符，并附带 `SHA256SUMS.txt`。

Windows 包未使用发布者证书签名，macOS 包使用 ad-hoc 签名且未经 Apple 公证，首次打开可能需要在系统安全设置中允许。正式分发的证书签名及公证需要提供相应凭据；macOS 配置应移除 `mac.identity: "-"` 并启用 `mac.hardenedRuntime`。当前 Electron 25 已结束维护，后续仍需升级运行时并验证兼容性。

## 本地构建

使用 Node.js 22.23.4。项目沿用 Vue CLI 4，构建脚本带有所需的 OpenSSL 兼容参数，electron-builder 固定为 26.18.0。

```sh
npm ci
npm test
# Windows
npm run electron:build -- --win --x64 --publish never
# macOS
npm run electron:build:mac:arm64
# Linux
npm run electron:build -- --linux --x64 --publish never
```

Windows 可将 `--x64` 替换为 `--ia32` 或 `--arm64`，macOS / Linux 可使用 `--x64` 或 `--arm64`。各系统的安装包应在对应系统的构建机上生成，产物位于 `dist_electron/`。

## 自动构建与发布

将更新版本的代码推送到 `codex/release-<版本号>` 分支（如 `codex/release-3.1.1`），`Build and Release` 流程会构建上述七种系统 / CPU 组合，运行回归检查并验证可执行文件架构和安装包。

全部通过后，流程汇总 11 个安装包、生成 SHA-256 校验文件，再创建同版本标签和 Release。资产先上传至草稿，完整后公开。手动运行该工作流只构建产物，不发布 Release。更新内容见 [CHANGELOG.md](CHANGELOG.md)。

## 代理与 Google 访问频率

在「设置 → 网络」启用代理，填写代理软件的 **HTTP/Mixed 地址与端口**，例如 `127.0.0.1` 和 `7890`，然后点击「测试 Google 连接」。这里不支持 SOCKS 端口，也不会自动读取系统代理。连接检测成功只代表 Google 网页可达，不保证翻译端点没有受到限制。

百度、Google、镜像列表和手动镜像检测统一经过主进程的请求库。启用代理时 HTTP 和 HTTPS 都使用该代理；代理错误会报错，关闭代理后直连，环境变量中的代理不会覆盖应用设置。

Google 翻译在停止输入 1 秒后请求，两次请求至少间隔 2 秒；相同的进行中请求会合并，成功结果在内存缓存 10 分钟（最多 100 条，退出后清空）。过时的排队请求会跳过，旧结果不会覆盖新文本。镜像可用性改为手动检测，避免每次打开设置都请求翻译端点。

收到 HTTP 429 时暂停请求至少 60 秒，并尊重服务端更长的 `Retry-After`；不会自动重试。HTTP 403 或验证页面会给出提示。代理出口 IP 仍可能受到 Google 限制。

请求携带应用自带 Chromium 的 User-Agent，以及对应域名的 Origin/Referer，文本通过表单 POST 发送。当前使用未公开的 `translate_a/single` 端点（`client=gtx`），它不是官方网页版的完整浏览器会话，也没有稳定性或配额保证。需要长期稳定调用时，应使用 [Cloud Translation API](https://cloud.google.com/translate)。
