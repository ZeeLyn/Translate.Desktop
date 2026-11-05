## 3.1.1

- 新增 Windows x64、x86、ARM64，macOS Intel、Apple Silicon，以及 Linux x64、ARM64 安装包。
- 修复部分请求绕过应用代理的问题，统一 HTTP/HTTPS 代理链路，新增 Google 连接检测。
- Google 翻译新增请求合并、短期缓存、请求间隔和 HTTP 429 冷却，避免旧译文覆盖新文本。
- 修复 macOS 退出和重新显示窗口的行为，镜像检测改为手动 HTTP 检测。
- 安装包文件名标注系统与 CPU 架构，并提供 SHA256SUMS.txt 校验文件。

### 选择安装包

| 系统 | CPU | 文件标记 |
| --- | --- | --- |
| Windows | Intel / AMD 64 位 | win-x64-setup.exe |
| Windows | Intel / AMD 32 位 | win-ia32-setup.exe |
| Windows | ARM64 | win-arm64-setup.exe |
| macOS | Intel | mac-x64.dmg / .zip |
| macOS | Apple Silicon | mac-arm64.dmg / .zip |
| Linux | Intel / AMD 64 位 | linux-x86_64.AppImage / linux-amd64.deb |
| Linux | ARM64 | linux-arm64.AppImage / .deb |

### 已知限制

- Windows 安装包未使用发布者证书签名；macOS 使用 ad-hoc 签名，未经过 Apple 公证，首次打开可能需要在系统安全设置中允许。
- Google 使用未公开端点，代理出口仍可能被限流；收到 429 后程序会等待，不自动重试。
- 仍沿用 Electron 25，尚未升级其已结束维护的运行时。本次验证覆盖构建、架构、包完整性和回归检查，未覆盖所有系统与 CPU 的真实安装及交互。
