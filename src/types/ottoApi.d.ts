export interface MaestroModuleRegistration {
  moduleId: string;
  displayName: string;
  category: string;
  modulePackage?: string;
  entryRoute: string;
  uiContract: string;
  panels: string[];
  capabilities: string[];
}

export interface MaestroUiContract {
  contractId: string;
  runtime: string;
  entryPageId: string;
  pages: Array<{
    id: string;
    label: string;
    route: string;
    panel: string;
  }>;
}

export interface MaestroContractsLoadResult {
  ok: boolean;
  maestroRoot: string;
  registration?: MaestroModuleRegistration;
  uiContract?: MaestroUiContract;
  error?: string;
}

export interface BootstrapStatusStage {
  stage: string;
  command: string;
  ok: boolean;
  detail: unknown;
}

export interface BootstrapStatusResult {
  ok: boolean;
  stages: BootstrapStatusStage[];
  degradedStages: string[];
  error?: string;
}

declare global {
  interface Window {
    ottoApi: {
      appName: string;
      version: string;
      readiness: string;
      loadMaestroContracts: () => Promise<MaestroContractsLoadResult>;
      getBootstrapStatus: () => Promise<BootstrapStatusResult>;
    };
  }
}

export {};
