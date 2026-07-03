import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';

export type TrayStatus = 'healthy' | 'update_available' | 'applying' | 'error';

export interface TrayManagerOptions {
  onOpen: () => void;
}

const STATUS_COLORS: Record<TrayStatus, string> = {
  healthy: '#16a34a',
  update_available: '#2563eb',
  applying: '#ca8a04',
  error: '#dc2626',
};

function makeStatusIcon(status: TrayStatus): Electron.NativeImage {
  const color = encodeURIComponent(STATUS_COLORS[status]);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="24" fill="${color}" />
      <circle cx="32" cy="32" r="10" fill="white" opacity="0.9" />
    </svg>
  `;

  let icon = nativeImage.createFromDataURL(`data:image/svg+xml;utf8,${svg}`);

  if (process.platform === 'linux') {
    icon = icon.resize({ width: 22, height: 22 });
  }

  if (process.platform === 'darwin') {
    icon.setTemplateImage(false);
  }

  return icon;
}

export class TrayManager {
  private tray: Tray;
  private status: TrayStatus;
  private readonly onOpen: () => void;

  constructor(options: TrayManagerOptions) {
    this.status = 'healthy';
    this.onOpen = options.onOpen;
    this.tray = new Tray(makeStatusIcon(this.status));

    this.configureMenu();
    this.configureActivation();
    this.refreshTooltip();
  }

  public setStatus(status: TrayStatus): void {
    this.status = status;
    this.tray.setImage(makeStatusIcon(status));
    this.refreshTooltip();
  }

  public dispose(): void {
    this.tray.destroy();
  }

  private configureMenu(): void {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Open OttoHelper',
        click: () => this.onOpen(),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ]);

    this.tray.setContextMenu(menu);
  }

  private configureActivation(): void {
    this.tray.on('double-click', () => this.onOpen());
    this.tray.on('click', () => {
      if (process.platform !== 'darwin') {
        this.onOpen();
      }
    });
  }

  private refreshTooltip(): void {
    this.tray.setToolTip(`OttoHelper (${this.status})`);
  }
}

export function revealMainWindow(window: BrowserWindow): void {
  if (window.isMinimized()) {
    window.restore();
  }

  if (!window.isVisible()) {
    window.show();
  }

  window.focus();
}
