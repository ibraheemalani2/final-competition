const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');


// Auto Updater Configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // This is crucial for security and using Node.js features in your UI
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Keep false for security
            contextIsolation: true,  // Keep true for security
            sandbox: false // Allow requiring local files in preload
        }
    });

    // Load the index.html of the app.
    mainWindow.loadFile('dist/index.html');

    // Create custom menu
    createMenu();

    // Optional: Open the DevTools (remove this line for production)
    // mainWindow.webContents.openDevTools();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Check for Updates',
                    click: () => {
                        autoUpdater.checkForUpdates();
                        if (mainWindow) {
                            mainWindow.webContents.send('update-message', { status: 'checking' });
                        }
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC Handlers for Updater
ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates();
});

ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.on('quit-and-install', () => {
    autoUpdater.quitAndInstall();
});

// Auto Updater Events
autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-not-available', info);
});

autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('update-error', err.toString());
});

autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) mainWindow.webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-downloaded', info);
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();
    // Check for updates on startup (optional, user asked for manual check here, keeping startup check if desired or removing it to be manual first)
    // autoUpdater.checkForUpdatesAndNotify();


    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});