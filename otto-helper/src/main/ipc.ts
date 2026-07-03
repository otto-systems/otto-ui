import { ipcMain } from 'electron';

import type {
  ApproveRequest,
  CheckNowResponse,
  DeferRequest,
  DeferResponse,
  HistoryResponse,
  IpcResponse,
  UpdateConfig,
  UpdateProgress,
  UpdateState,
} from '../shared/types';

interface RegisterIpcOptions {
  baseUrl: string;
}

interface ServiceErrorBody {
  error?: string;
}

const DEFAULT_HISTORY_LIMIT = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function ok<T>(data: T): IpcResponse<T> {
  return { ok: true, data };
}

function fail<T>(message: string): IpcResponse<T> {
  return { ok: false, error: message };
}

async function parseServiceError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ServiceErrorBody;
    if (isString(payload.error)) {
      return payload.error;
    }
  } catch {
    // Ignore JSON parse errors and use status fallback.
  }

  return `service request failed with status ${response.status}`;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<IpcResponse<T>> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      return fail<T>(await parseServiceError(response));
    }

    const payload = (await response.json()) as T;
    return ok(payload);
  } catch (error) {
    return fail<T>(`request error: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

function validateApproveRequest(value: unknown): value is ApproveRequest {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.checkId);
}

function validateDeferRequest(value: unknown): value is DeferRequest {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.checkId) && isNonNegativeInteger(value.deferSeconds) && value.deferSeconds > 0;
}

function validateConfigPatch(value: unknown): value is Partial<UpdateConfig> {
  if (!isRecord(value)) {
    return false;
  }

  const allowedKeys = [
    'autoCheckEnabled',
    'channel',
    'checkIntervalSeconds',
    'maxDeferredDays',
    'allowMeteredDownload',
  ];

  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

export function registerIpcHandlers(options: RegisterIpcOptions): void {
  const baseUrl = options.baseUrl.replace(/\/$/, '');

  ipcMain.handle('otto:getState', async (): Promise<IpcResponse<UpdateState>> => {
    return fetchJson<UpdateState>(`${baseUrl}/v1/state`);
  });

  ipcMain.handle('otto:checkNow', async (): Promise<IpcResponse<CheckNowResponse>> => {
    return fetchJson<CheckNowResponse>(`${baseUrl}/v1/check`, {
      method: 'POST',
    });
  });

  ipcMain.handle('otto:getHistory', async (): Promise<IpcResponse<HistoryResponse>> => {
    return fetchJson<HistoryResponse>(`${baseUrl}/v1/history?limit=${DEFAULT_HISTORY_LIMIT}&offset=0`);
  });

  ipcMain.handle('otto:getProgress', async (): Promise<IpcResponse<UpdateProgress | null>> => {
    try {
      const response = await fetch(`${baseUrl}/v1/progress`);
      if (response.status === 204) {
        return ok<UpdateProgress | null>(null);
      }
      if (!response.ok) {
        return fail<UpdateProgress | null>(await parseServiceError(response));
      }

      const payload = (await response.json()) as UpdateProgress;
      return ok<UpdateProgress | null>(payload);
    } catch (error) {
      return fail<UpdateProgress | null>(`request error: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  });

  ipcMain.handle('otto:approve', async (_event, request: unknown): Promise<IpcResponse<Record<string, never>>> => {
    if (!validateApproveRequest(request)) {
      return fail('invalid approve request payload');
    }

    return fetchJson<Record<string, never>>(`${baseUrl}/v1/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  });

  ipcMain.handle('otto:defer', async (_event, request: unknown): Promise<IpcResponse<DeferResponse>> => {
    if (!validateDeferRequest(request)) {
      return fail('invalid defer request payload');
    }

    return fetchJson<DeferResponse>(`${baseUrl}/v1/defer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  });

  ipcMain.handle('otto:getConfig', async (): Promise<IpcResponse<UpdateConfig>> => {
    return fetchJson<UpdateConfig>(`${baseUrl}/v1/config`);
  });

  ipcMain.handle('otto:setConfig', async (_event, patch: unknown): Promise<IpcResponse<UpdateConfig>> => {
    if (!validateConfigPatch(patch)) {
      return fail('invalid config payload');
    }

    return fetchJson<UpdateConfig>(`${baseUrl}/v1/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  });
}
