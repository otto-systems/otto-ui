import { describe, expect, it } from "vitest";

import { getMaestroPanelBinding } from "../src/services/maestroPanelBindingService.js";
import type { BootstrapStatusResult, MaestroContractsLoadResult } from "../src/types/ottoApi.js";

function createContracts(): MaestroContractsLoadResult {
  return {
    ok: true,
    maestroRoot: "D:/OneDrive/Documents/GitHub/Maestro",
    registration: {
      moduleId: "maestro",
      displayName: "Maestro",
      category: "runtime",
      modulePackage: "otto/modules/maestro/manifest.json",
      entryRoute: "/maestro/install-status",
      uiContract: "otto/manifests/maestro-ui-contract.json",
      panels: ["install-status", "runtime-status", "registry-browser"],
      capabilities: ["maestro.install", "maestro.runtime.monitor", "maestro.registry.search"]
    },
    uiContract: {
      contractId: "maestro-otto-ui-contract",
      runtime: "maestro",
      entryPageId: "maestro.install-status",
      pages: [
        {
          id: "maestro.install-status",
          label: "Install Status",
          route: "/maestro/install-status",
          panel: "install-status"
        },
        {
          id: "maestro.runtime-monitor",
          label: "Runtime Monitor",
          route: "/maestro/runtime-monitor",
          panel: "runtime-monitor"
        }
      ]
    }
  };
}

function createBootstrapStatus(): BootstrapStatusResult {
  return {
    ok: true,
    stages: [],
    degradedStages: []
  };
}

describe("Maestro panel binding service", () => {
  it("returns install-status panel bindings", () => {
    const binding = getMaestroPanelBinding({
      panel: "install-status",
      contracts: createContracts(),
      bootstrapStatus: createBootstrapStatus(),
      selectedRoute: "/maestro/install-status"
    });

    expect(binding.cards.length).toBeGreaterThan(0);
    expect(binding.updates.length).toBeGreaterThan(0);
    expect(binding.events.some((event) => event.id.includes("route:"))).toBe(true);
    expect(binding.render.timeline).toBe(true);
  });

  it("returns runtime-monitor module bindings", () => {
    const binding = getMaestroPanelBinding({
      panel: "runtime-monitor",
      contracts: createContracts(),
      bootstrapStatus: createBootstrapStatus(),
      selectedRoute: "/maestro/runtime-monitor"
    });

    expect(binding.modules.length).toBeGreaterThan(0);
    expect(binding.events.some((event) => event.detail.includes("panel"))).toBe(true);
    expect(binding.render.modules).toBe(true);
  });

  it("returns diagnostics panel events", () => {
    const binding = getMaestroPanelBinding({
      panel: "diagnostics",
      contracts: createContracts(),
      bootstrapStatus: {
        ok: true,
        stages: [],
        degradedStages: ["installer-orchestration"]
      },
      selectedRoute: "/maestro/diagnostics"
    });

    expect(binding.events.length).toBeGreaterThan(0);
    expect(binding.events.some((event) => event.id.includes("degraded:installer-orchestration"))).toBe(true);
    expect(binding.render.events).toBe(true);
  });
});
