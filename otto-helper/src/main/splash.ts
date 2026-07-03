import { BrowserWindow } from 'electron';
import path from 'node:path';

const MIN_SPLASH_DURATION_MS = 1800;

export function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 560,
    height: 360,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const splashUrl = `${MAIN_WINDOW_VITE_DEV_SERVER_URL.replace(/\/$/, '')}/src/renderer/splash.html`;
    void splash.loadURL(splashUrl);
  } else {
    void splash.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/splash.html`),
    );
  }

  splash.once('ready-to-show', () => {
    splash.show();
  });

  return splash;
}

export function announceSplashReady(splash: BrowserWindow, version: string): void {
  splash.webContents.send('splash:version', version);
  splash.webContents.send('splash:ready');
}

export async function ensureMinimumSplashDuration(startedAt: number): Promise<void> {
  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(0, MIN_SPLASH_DURATION_MS - elapsed);

  if (remaining === 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), remaining);
  });
}
