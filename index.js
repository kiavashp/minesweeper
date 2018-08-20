'use strict';

const electron = require('electron');
const {app, BrowserWindow, Menu, shell, ipcMain} = electron;
const defaultMenu = require('electron-default-menu');

let mainWindow;

function createWindow() {
    const screen = electron.screen.getPrimaryDisplay().bounds;
    const width = 420;
    const height = 460;
    const padding = 20;

	mainWindow = new BrowserWindow({
        width,
        height,
        minWidth: 260,
        minHeight: 300,
        x: screen.width - width - padding,
        y: 20 + padding,
        titleBarStyle: 'hiddenInset',
        show: false
    });
    mainWindow.once('ready-to-show', () => mainWindow.show());
	mainWindow.loadFile('static/index.html');
	mainWindow.once('closed', () => mainWindow = null);
}

app.on('ready', () => {
    const menu = defaultMenu(app, shell);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

    createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});
