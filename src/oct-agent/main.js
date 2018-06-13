const {app, BrowserWindow, Tray, ipcMain, dialog, Menu, MenuItem} = require("electron");
const path = require("path");
let mainWindow = null;
let tray = null;
let trayOpenMenu = null;
let trayExitMenu = null;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 500,
        frame: false,
        resizable: false,
        maximizable:false
    });
    console.log(app.getAppPath());
    tray = new Tray(path.join(app.getAppPath(), "logoBlack.png"));
    tray.setToolTip("OCTAgent");
    trayOpenMenu = new MenuItem({
        label: '打开主界面',
        click: ()=>{mainWindow.show();trayOpenMenu.enabled = false;},
        enabled: false
    });
    trayExitMenu = new MenuItem({
        label: '退出',
        click: ()=>{
            app.quit();
        }
    });
    const trayMenu = new Menu();
    trayMenu.append(trayOpenMenu);
    trayMenu.append(trayExitMenu);
    tray.setContextMenu(trayMenu);
    app.setName("OCTAgent");
    global.distPath = path.join(app.getPath('appData'), app.getName(), "downloads");
    mainWindow.loadURL(path.join(app.getAppPath(), 'index.html'));
    // mainWindow.webContents.openDevTools();
});
ipcMain.on('open-download-path', (evt, args) => {
    dialog.showOpenDialog(mainWindow, {
        defaultPath:args,
        properties:[
            'openFile',
            'openDirectory'
        ]
    }, (files)=>{
        if(files) {
            evt.sender.send('download-path-choose', files)
        }
    })
});

ipcMain.on('show-error', (evt, args) => {
    dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: args.title,
        message: args.msg
    });
});
ipcMain.on('request-min', ()=>{
    mainWindow.minimize();
});
ipcMain.on('request-hide', ()=>{
    mainWindow.hide();
    trayOpenMenu.enabled = true;
});
ipcMain.on('open-dev', ()=>{
    if(!mainWindow.webContents.isDevToolsOpened()){
        mainWindow.webContents.openDevTools({mode:'undocked'});
    }
});
app.on('window-all-closed', () => {
   if (process.platform !== "darwin") app.quit();
});
require('./render-events/download-events');