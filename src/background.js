'use strict'
/*eslint-disable */
import { app, protocol, BrowserWindow, ipcMain, nativeImage, Tray, Menu, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
var path = require('path');
const isDevelopment = process.env.NODE_ENV !== 'production'
var appTray = null;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])
var mainWindow = null;
async function createWindow() {
    // Create the browser window.
    const cwd = isDevelopment ? null : path.join(__dirname, '..');
    const win = mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        show: false,
        skipTaskbar: true,
        icon: nativeImage.createFromPath(isDevelopment ? path.join("./public", "logo.ico") : path.join(cwd, "app.asar/logo.ico")),
        webPreferences: {

            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            webSecurity: false
        },
        darkTheme: true,
        //alwaysOnTop: true,
        frame: false,
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
            // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
    win.on("close", event => {
        event.preventDefault();
        win.hide();
        win.setSkipTaskbar(true);
    });
    win.on("focus", async() => {
        win.webContents.send("OnWindowFocus");
    });
}
if (!isDevelopment) {
    // app.setLoginItemSettings({
    //     //设置开机启动  
    //     openAtLogin: true
    // });
}
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

async function SwitchWindow() {
    console.log('SwitchWindow');
    if (mainWindow.isVisible()) {
        mainWindow.hide();
        mainWindow.setSkipTaskbar(true);
    } else {
        mainWindow.show();
        mainWindow.setSkipTaskbar(false);
        mainWindow.webContents.send("OnWindowFocus");
    }
}

const additionalData = { myKey: '78350E37-7019-4BEA-9938-7155D3B382A9' }
const locker = app.requestSingleInstanceLock(additionalData);
if (!locker) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
            mainWindow.show()
        }
    });
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', async() => {
        if (isDevelopment && !process.env.IS_TEST) {
            // Install Vue Devtools
            try {
                await installExtension(VUEJS3_DEVTOOLS)
            } catch (e) {
                console.error('Vue Devtools failed to install:', e.toString())
            }
        }
        createWindow()
        const cwd = isDevelopment ? null : path.join(__dirname, '..');
        appTray = new Tray(isDevelopment ? path.join("./public", "logo.ico") : path.join(cwd, "app.asar/logo.ico"));
        appTray.setToolTip("集成翻译");
        let trayMenuTemplate = [{
            label: '显示/隐藏窗口(Ctrl/Command+`)',
            click: function() {
                SwitchWindow();
            }
        }, {
            label: '退出',
            click: function() {
                app.quit();
                app.exit();
            }
        }];
        const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
        appTray.setContextMenu(contextMenu);
        // 单机托盘小图标显示应用
        appTray.on('double-click', function() {
            mainWindow.show();
            mainWindow.setSkipTaskbar(false);
        });
        //注册全局快捷键
        globalShortcut.register('CommandOrControl+`', function() {
            SwitchWindow();
        });
    })
}




// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
ipcMain.on("SetAlwaysOnTop", (event, arg) => {
    mainWindow.setAlwaysOnTop(arg, "normal");
});
ipcMain.on("CloseWindow", (event, arg) => {
    mainWindow.close();
});