import { afterEach, describe, expect, it, vi } from "vitest";

import { getMaestroPageNavigation, loadBootstrapStatus, loadMaestroContracts } from "../src/services/maestroContractService.js";

describe("Maestro contract service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns explicit error when preload bridge is unavailable", async () => {
    vi.stubGlobal("window", {});

    const result = await loadMaestroContracts();
    const bootstrapResult = await loadBootstrapStatus();

    expect(result.ok).toBe(false);
    expect(result.error).toContain("preload bridge");
    expect(bootstrapResult.ok).toBe(false);
    expect(bootstrapResult.error).toContain("bootstrap status bridge");
  });

  it("returns preload bridge payload when available", async () => {
    vi.stubGlobal("window", {
      ottoApi: {
        appName: "Otto UI",
        version: "0.2.2",
        readiness: "bootstrapped",
        loadMaestroContracts: async () => ({
          ok: true,
          maestroRoot: "D:/OneDrive/Documents/GitHub/Maestro",
          registration: {
            moduleId: "maestro",
            displayName: "Maestro",
            category: "platform",
            entryRoute: "/maestro/install-status",
            uiContract: "maestro-ui-contract",
            panels: ["install-status"],
            capabilities: ["install", "repair"]
          },
          uiContract: {
            contractId: "maestro-ui-contract",
            runtime: "otto-ui",
            entryPageId: "install-status",
            pages: [
              {
                id: "install-status",
                label: "Install Status",
                route: "/maestro/install-status",
                panel: "install-status-panel"
              }
            ]
          }
        }),
        getBootstrapStatus: async () => ({
          ok: true,
          stages: [],
          degradedStages: ["installer-orchestration"]
        })
      }
    });

    const result = await loadMaestroContracts();
    const bootstrapResult = await loadBootstrapStatus();

    expect(result.ok).toBe(true);
    expect(result.registration?.moduleId).toBe("maestro");
    expect(result.uiContract?.entryPageId).toBe("install-status");
    expect(bootstrapResult.ok).toBe(true);
    expect(bootstrapResult.degradedStages).toContain("installer-orchestration");
  });

  it("derives maestro page navigation from loaded contract", async () => {
    const contracts = {
      ok: true,
      maestroRoot: "D:/OneDrive/Documents/GitHub/Maestro",
      registration: {
        moduleId: "maestro",
        displayName: "Maestro",
        category: "platform",
        entryRoute: "/maestro/install-status",
        uiContract: "maestro-ui-contract",
        panels: ["install-status"],
        capabilities: ["install", "repair"]
      },
      uiContract: {
        contractId: "maestro-ui-contract",
        runtime: "otto-ui",
        entryPageId: "install-status",
        pages: [
          {
            id: "install-status",
            label: "Install Status",
            route: "/maestro/install-status",
            panel: "install-status-panel"
          },
          {
            id: "runtime-status",
            label: "Runtime Status",
            route: "/maestro/runtime-status",
            panel: "runtime-status-panel"
          }
        ]
      }
    } as const;

    const pages = getMaestroPageNavigation(contracts);

    expect(pages.length).toBe(2);
    expect(pages[0].route).toBe("/maestro/install-status");
    expect(pages[1].id).toBe("runtime-status");
  });
});
