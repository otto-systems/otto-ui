import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import { registerIpcHandlers } from './ipc';
import { announceSplashReady, createSplashWindow, ensureMinimumSplashDuration } from './splash';
import { revealMainWindow, TrayManager } from './tray';

if (started) {
  app.quit();
}

const createMainWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    title: 'OttoHelper',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  return mainWindow;
};

let trayManager: TrayManager | null = null;

app.on('ready', () => {
  const splashStartedAt = Date.now();
  const splashWindow = createSplashWindow();
  const mainWindow = createMainWindow();

  registerIpcHandlers({
    baseUrl: process.env.OTTOUPDATE_API_BASE_URL ?? 'http://localhost:7430',
  });

  trayManager = new TrayManager({
    onOpen: () => revealMainWindow(mainWindow),
  });

  void (async () => {
    await ensureMinimumSplashDuration(splashStartedAt);
    announceSplashReady(splashWindow, app.getVersion());
    revealMainWindow(mainWindow);

    setTimeout(() => {
      if (!splashWindow.isDestroyed()) {
        splashWindow.close();
      }
    }, 320);
  })();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const mainWindow = createMainWindow();
    if (trayManager) {
      trayManager.setStatus('healthy');
    } else {
      trayManager = new TrayManager({
        onOpen: () => revealMainWindow(mainWindow),
      });
    }
  }
});

app.on('before-quit', () => {
  trayManager?.dispose();
  trayManager = null;
});
