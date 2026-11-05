module.exports = {
    // publicPath: "/app/",
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                appId: "com.cilent.app.translate.desktop",
                productName: "Translate Desktop",
                // Vue CLI 已将依赖打入 bundle，避免重复包含根目录的 node_modules。
                files: ["**/*", "!node_modules{,/**/*}"],
                directories: {
                    output: "./dist_electron",
                },
                win: {
                    icon: "./public/logo@512.png",
                },
                mac: {
                    icon: "./public/logo@512.png",
                    category: "public.app-category.productivity",
                    artifactName: "${productName}-${version}-mac-${arch}.${ext}",
                    target: [
                        { target: "dmg", arch: ["arm64"] },
                        { target: "zip", arch: ["arm64"] },
                    ],
                },
                linux: {
                    icon: "./public/logo@512.png",
                },
                nsis: {
                    oneClick: false,
                    guid: "78350E37-7019-4BEA-9938-7155D3B382A9",
                    perMachine: true,
                    allowElevation: true,
                    allowToChangeInstallationDirectory: true,
                    installerIcon: "./public/logo@256.ico",
                    uninstallerIcon: "./public/logo@256.ico",
                    installerHeaderIcon: "./public/logo@256.ico",
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    shortcutName: "Translate Desktop",
                },
            },
        },
    },
};
