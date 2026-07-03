import { describe, expect, it } from "vitest";

import { getSystemSummary } from "../src/services/dashboardService.js";
import { getModules } from "../src/services/moduleRegistryService.js";
import { getUpdates } from "../src/services/updateService.js";

describe("UI services", () => {
  it("returns dashboard summary cards", () => {
    const cards = getSystemSummary();
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.some((card) => card.label === "Kernel")).toBe(true);
  });

  it("returns module registry entries", () => {
    const modules = getModules();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.every((m) => m.id && m.version)).toBe(true);
  });

  it("returns update timeline entries", () => {
    const updates = getUpdates();
    expect(updates.length).toBeGreaterThan(0);
    expect(updates.some((u) => u.status === "queued")).toBe(true);
  });
});
