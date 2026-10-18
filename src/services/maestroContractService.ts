import type { BootstrapStatusResult, MaestroContractsLoadResult } from "../types/ottoApi";

export async function loadMaestroContracts(): Promise<MaestroContractsLoadResult> {
  if (!window.ottoApi || typeof window.ottoApi.loadMaestroContracts !== "function") {
    return {
      ok: false,
      maestroRoot: "",
      error: "ottoApi preload bridge is unavailable."
    };
  }
  return window.ottoApi.loadMaestroContracts();
}

export function getMaestroPageNavigation(contracts: MaestroContractsLoadResult | null) {
  if (!contracts?.ok || !contracts.uiContract) {
    return [];
  }
  return contracts.uiContract.pages;
}

export async function loadBootstrapStatus(): Promise<BootstrapStatusResult> {
  if (!window.ottoApi || typeof window.ottoApi.getBootstrapStatus !== "function") {
    return {
      ok: false,
      stages: [],
      degradedStages: [],
      error: "ottoApi bootstrap status bridge is unavailable."
    };
  }
  return window.ottoApi.getBootstrapStatus();
}
