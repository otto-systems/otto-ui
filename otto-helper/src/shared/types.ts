export interface UpdateState {
  phase: 'idle' | 'checking' | 'update_available' | 'downloading' | 'applying' | 'error';
  currentVersion: string;
  availableVersion?: string;
  lastCheckAt: string;
  error?: string;
  activeManifest?: ReleaseManifest | null;
  deviceState?: DeviceState;
}

export interface UpdateProgress {
  bytesReceived: number;
  totalBytes: number;
  percent: number;
  etaSeconds: number | null;
}

export interface ReleaseManifest {
  version: string;
  channel: 'stable' | 'beta' | 'canary' | 'lts';
  releasedAt: string;
  notes: string[];
}

export interface DeviceState {
  deviceId: string;
  hostname: string;
  platform: NodeJS.Platform;
  managed: boolean;
  deferredCount: number;
}

export interface PolicyResult {
  decision: 'approved' | 'deferred' | 'blocked';
  reason: string;
  retryAfter?: string;
}

export interface UpdateHistoryItem {
  id: string;
  version: string;
  occurredAt: string;
  outcome: 'applied' | 'deferred' | 'blocked' | 'failed' | 'rolled_back';
  details?: string;
}

export interface HistoryResponse {
  items: UpdateHistoryItem[];
  total: number;
}

export interface CheckNowResponse {
  checkId: string;
  triggeredAt: string;
}

export interface ApproveRequest {
  checkId: string;
}

export interface DeferRequest {
  checkId: string;
  deferSeconds: number;
}

export interface DeferResponse {
  until: string;
}

export interface UpdateConfig {
  autoCheckEnabled: boolean;
  channel: 'stable' | 'beta' | 'canary' | 'lts';
  checkIntervalSeconds: number;
  maxDeferredDays: number;
  allowMeteredDownload: boolean;
}

export interface IpcResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
