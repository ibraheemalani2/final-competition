const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
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
    mainWindow.loadFile('index.html');

    // Optional: Open the DevTools (remove this line for production)
    // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();

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