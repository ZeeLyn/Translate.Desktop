module.exports = {
    // publicPath: "/app/",
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                "appId": "com.cilent.app.translate.desktop",
                "productName": "Translate Desktop",
                "directories": {
                    "output": "./dist_electron"
                },
                "win": {
                    "icon": "./public/logo.ico"
                },
                "mac": {
                    "icon": "./public/logo.ico"
                },
                "linux": {
                    "icon": "./public/logo.ico"
                },
                "nsis": {
                    "oneClick": false,
                    "guid": "78350E37-7019-4BEA-9938-7155D3B382A9",
                    "perMachine": true,
                    "allowElevation": true,
                    "allowToChangeInstallationDirectory": true,
                    "installerIcon": "./public/logo.ico",
                    "uninstallerIcon": "./public/logo.ico",
                    "installerHeaderIcon": "./public/.logo.ico",
                    "createDesktopShortcut": true,
                    "createStartMenuShortcut": true,
                    "shortcutName": "Translate Desktop"
                }
            }
        }
    }
}