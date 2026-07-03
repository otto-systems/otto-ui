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
} from '../../shared/types';

function unwrapIpcResponse<T>(response: IpcResponse<T>): T {
  if (!response.ok || response.data === undefined) {
    throw new Error(response.error ?? 'IPC request failed');
  }

  return response.data;
}

export async function getState(): Promise<UpdateState> {
  const response = await window.ottoHelper.api.getState();
  return unwrapIpcResponse(response);
}

export async function checkNow(): Promise<CheckNowResponse> {
  const response = await window.ottoHelper.api.checkNow();
  return unwrapIpcResponse(response);
}

export async function getHistory(): Promise<HistoryResponse> {
  const response = await window.ottoHelper.api.getHistory();
  return unwrapIpcResponse(response);
}

export async function getProgress(): Promise<UpdateProgress | null> {
  const response = await window.ottoHelper.api.getProgress();
  return unwrapIpcResponse(response);
}

export async function approve(request: ApproveRequest): Promise<Record<string, never>> {
  const response = await window.ottoHelper.api.approve(request);
  return unwrapIpcResponse(response);
}

export async function defer(request: DeferRequest): Promise<DeferResponse> {
  const response = await window.ottoHelper.api.defer(request);
  return unwrapIpcResponse(response);
}

export async function getConfig(): Promise<UpdateConfig> {
  const response = await window.ottoHelper.api.getConfig();
  return unwrapIpcResponse(response);
}

export async function setConfig(patch: Partial<UpdateConfig>): Promise<UpdateConfig> {
  const response = await window.ottoHelper.api.setConfig(patch);
  return unwrapIpcResponse(response);
}
