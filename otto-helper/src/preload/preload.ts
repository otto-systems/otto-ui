import { contextBridge, ipcRenderer } from 'electron';

import type {
  ApproveRequest,
  DeferRequest,
  DeferResponse,
  HistoryResponse,
  IpcResponse,
  UpdateConfig,
  UpdateProgress,
  UpdateState,
  CheckNowResponse,
} from '../shared/types';

const runtime = {
  platform: process.platform,
  versions: process.versions,
};

contextBridge.exposeInMainWorld('ottoHelper', {
  runtime,
  splash: {
    onReady: (callback: () => void): (() => void) => {
      const listener = (): void => callback();
      ipcRenderer.on('splash:ready', listener);
      return () => {
        ipcRenderer.removeListener('splash:ready', listener);
      };
    },
    onVersion: (callback: (version: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, version: unknown): void => {
        if (typeof version === 'string') {
          callback(version);
        }
      };

      ipcRenderer.on('splash:version', listener);
      return () => {
        ipcRenderer.removeListener('splash:version', listener);
      };
    },
  },
  api: {
    getState: (): Promise<IpcResponse<UpdateState>> => ipcRenderer.invoke('otto:getState'),
    checkNow: (): Promise<IpcResponse<CheckNowResponse>> => ipcRenderer.invoke('otto:checkNow'),
    getHistory: (): Promise<IpcResponse<HistoryResponse>> => ipcRenderer.invoke('otto:getHistory'),
    getProgress: (): Promise<IpcResponse<UpdateProgress | null>> => ipcRenderer.invoke('otto:getProgress'),
    approve: (request: ApproveRequest): Promise<IpcResponse<Record<string, never>>> =>
      ipcRenderer.invoke('otto:approve', request),
    defer: (request: DeferRequest): Promise<IpcResponse<DeferResponse>> =>
      ipcRenderer.invoke('otto:defer', request),
    getConfig: (): Promise<IpcResponse<UpdateConfig>> => ipcRenderer.invoke('otto:getConfig'),
    setConfig: (patch: Partial<UpdateConfig>): Promise<IpcResponse<UpdateConfig>> =>
      ipcRenderer.invoke('otto:setConfig', patch),
  },
});

declare global {
  interface Window {
    ottoHelper: {
      runtime: {
        platform: NodeJS.Platform;
        versions: NodeJS.ProcessVersions;
      };
      splash: {
        onReady: (callback: () => void) => () => void;
        onVersion: (callback: (version: string) => void) => () => void;
      };
      api: {
        getState: () => Promise<IpcResponse<UpdateState>>;
        checkNow: () => Promise<IpcResponse<CheckNowResponse>>;
        getHistory: () => Promise<IpcResponse<HistoryResponse>>;
        getProgress: () => Promise<IpcResponse<UpdateProgress | null>>;
        approve: (request: ApproveRequest) => Promise<IpcResponse<Record<string, never>>>;
        defer: (request: DeferRequest) => Promise<IpcResponse<DeferResponse>>;
        getConfig: () => Promise<IpcResponse<UpdateConfig>>;
        setConfig: (patch: Partial<UpdateConfig>) => Promise<IpcResponse<UpdateConfig>>;
      };
    };
  }
}
