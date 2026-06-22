const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const isDev = !app.isPackaged;

// Auto-updater config (only in production)
if (!isDev) {
  autoUpdater.logger = console;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
}

function createMenu() {
  const template = [
    {
      label: 'Altera Cloud',
      submenu: [
        { role: 'about', label: 'About Altera Cloud' },
        { type: 'separator' },
        { role: 'quit', label: 'Quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
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
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => BrowserWindow.getAllWindows()[0]?.loadURL('https://alteracloud.space'),
        },
        {
          label: 'Admin Panel',
          accelerator: 'CmdOrCtrl+2',
          click: () => BrowserWindow.getAllWindows()[0]?.loadURL('https://alteracloud.space/admin'),
        },
        { type: 'separator' },
        { role: 'reload', label: 'Refresh' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Download Page',
          click: () => shell.openExternal('https://alteracloud.space/download'),
        },
        {
          label: 'Privacy Policy',
          click: () => shell.openExternal('https://alteracloud.space/privacy'),
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            if (!isDev) autoUpdater.checkForUpdatesAndNotify();
            else dialog.showMessageBox({ type: 'info', message: 'Auto-update only available in production builds.' });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Altera Cloud',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0A0A0A',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // Smooth show once ready
  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadURL('https://alteracloud.space');
  }

  // Allow auth popups inside Electron; open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com') || url.includes('__/auth/handler')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle navigation to /view/ and /admin etc.
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('https://alteracloud.space')) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  return win;
}

app.whenReady().then(() => {
  createMenu();
  const win = createWindow();

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Auto-updater events
autoUpdater.on('update-available', (info) => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('update_available', info);
});

autoUpdater.on('download-progress', (progress) => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('download_progress', progress);
});

autoUpdater.on('update-downloaded', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('update_downloaded');
});
