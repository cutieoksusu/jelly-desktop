const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
let walkWindow;

function createMainWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        hasShadow: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Default to click-through
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    
    // Load the transparent overlay
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Prevent the window from being closed accidentally
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createWalkWindow() {
    if (walkWindow) {
        walkWindow.focus();
        return;
    }

    walkWindow = new BrowserWindow({
        width: 900,
        height: 700,
        title: "Walking Jellyfish",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    walkWindow.loadFile(path.join(__dirname, 'renderer', 'walk.html'));

    walkWindow.on('closed', () => {
        walkWindow = null;
    });
}

app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.on('set-ignore-mouse', (event, ignore) => {
    if (mainWindow) {
        // Only forward true when ignoring to allow click-through underlying desktop
        mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
    }
});

ipcMain.on('open-walk', () => {
    createWalkWindow();
});

ipcMain.on('walk-done', (event, stats) => {
    if (mainWindow) {
        mainWindow.webContents.send('walk-result', stats);
    }
    if (walkWindow) {
        walkWindow.close();
    }
});

ipcMain.on('quit-app', () => {
    app.quit();
});