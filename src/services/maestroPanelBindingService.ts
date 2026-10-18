import type { BootstrapStatusResult, MaestroContractsLoadResult } from "../types/ottoApi";

type CardTone = "neutral" | "success" | "warning";

export interface MaestroPanelCard {
  label: string;
  value: string;
  tone: CardTone;
}

export interface MaestroPanelEvent {
  id: string;
  title: string;
  detail: string;
  status: string;
}

export interface MaestroPanelBinding {
  cards: MaestroPanelCard[];
  modules: Array<{
    id: string;
    name: string;
    version: string;
    state: string;
  }>;
  updates: Array<{
    id: string;
    label: string;
    status: string;
    detail: string;
  }>;
  events: MaestroPanelEvent[];
  render: {
    timeline: boolean;
    modules: boolean;
    events: boolean;
  };
}

interface MaestroPanelBindingInput {
  panel: string;
  contracts: MaestroContractsLoadResult;
  bootstrapStatus: BootstrapStatusResult | null;
  selectedRoute?: string;
}

export function getMaestroPanelBinding(input: MaestroPanelBindingInput): MaestroPanelBinding {
  const { panel, contracts, bootstrapStatus, selectedRoute } = input;
  const registration = contracts.registration;
  const uiContract = contracts.uiContract;

  const pages = uiContract?.pages ?? [];
  const capabilities = registration?.capabilities ?? [];
  const degradedStages = bootstrapStatus?.degradedStages ?? [];
  const entryRoute = registration?.entryRoute ?? "n/a";
  const modulePackage = registration?.modulePackage ?? "unavailable";

  const modules = pages.map((page) => ({
    id: page.id,
    name: page.label,
    version: page.route,
    state: selectedRoute === page.route ? "active" : "registered"
  }));

  const updates = [
    {
      id: "contracts-loaded",
      label: "Contracts loaded",
      status: contracts.ok ? "ok" : "error",
      detail: contracts.ok
        ? `Loaded ${pages.length} pages from ${uiContract?.contractId ?? "unknown contract"}.`
        : contracts.error ?? "Failed to load contracts."
    },
    {
      id: "module-registration",
      label: "Module registration",
      status: registration ? "ok" : "missing",
      detail: registration
        ? `Module ${registration.moduleId} (${registration.displayName}) registered with ${registration.panels.length} panels.`
        : "Module registration is unavailable."
    },
    {
      id: "bootstrap-health",
      label: "Bootstrap health",
      status: degradedStages.length > 0 ? "degraded" : "healthy",
      detail:
        degradedStages.length > 0
          ? `Degraded stages: ${degradedStages.join(", ")}.`
          : "All bootstrap stages reported healthy."
    }
  ];

  const events: MaestroPanelEvent[] = [
    ...pages.map((page) => ({
      id: `route:${page.id}`,
      title: page.label,
      detail: `${page.route} -> panel '${page.panel}'`,
      status: selectedRoute === page.route ? "active" : "registered"
    })),
    ...capabilities.slice(0, 6).map((capability) => ({
      id: `capability:${capability}`,
      title: capability,
      detail: "Capability surfaced from Maestro module registration.",
      status: "enabled"
    })),
    ...degradedStages.map((stage) => ({
      id: `degraded:${stage}`,
      title: stage,
      detail: "Bootstrap stage reported as degraded.",
      status: "warning"
    }))
  ];

  const baseCards: MaestroPanelCard[] = [
    { label: "Entry route", value: entryRoute, tone: "neutral" },
    { label: "Registered panels", value: String(pages.length), tone: "neutral" },
    { label: "Capabilities", value: String(capabilities.length), tone: "neutral" },
    { label: "Module package", value: modulePackage, tone: "neutral" },
    { label: "Bootstrap status", value: degradedStages.length > 0 ? "Degraded" : "Healthy", tone: degradedStages.length > 0 ? "warning" : "success" }
  ];

  switch (panel) {
    case "install-status":
      return {
        cards: [
          ...baseCards,
          { label: "Lifecycle command set", value: "install/update/repair/uninstall", tone: "success" }
        ],
        modules,
        updates,
        events,
        render: { timeline: true, modules: false, events: true }
      };
    case "runtime-status":
    case "runtime-monitor":
      return {
        cards: [
          ...baseCards,
          { label: "Run-state model", value: "pending/running/paused/failed/complete", tone: "success" },
          { label: "Event publication", value: "workflow.created/state.changed/checkpointed/cancelled", tone: "success" }
        ],
        modules,
        updates,
        events,
        render: { timeline: false, modules: true, events: true }
      };
    case "workflow-builder":
    case "node-graph":
      return {
        cards: [
          ...baseCards,
          { label: "Graph service", value: "In-memory v1", tone: "success" },
          { label: "Traversal contract", value: "enabled", tone: "success" }
        ],
        modules,
        updates,
        events,
        render: { timeline: false, modules: true, events: true }
      };
    case "registry-browser":
      return {
        cards: [
          ...baseCards,
          { label: "Capability classifier", value: "enabled", tone: "success" },
          { label: "Policy router", value: "health/perf/cost aware", tone: "success" }
        ],
        modules,
        updates,
        events,
        render: { timeline: false, modules: true, events: true }
      };
    case "execution-timeline":
      return {
        cards: [
          ...baseCards,
          { label: "Timeline source", value: "workflow runtime events", tone: "success" },
          { label: "Envelope mode", value: "deterministic", tone: "success" }
        ],
        modules,
        updates,
        events,
        render: { timeline: true, modules: false, events: true }
      };
    case "logs":
    case "diagnostics":
      return {
        cards: [
          ...baseCards,
          { label: "Log stream", value: "{otto.dataDir}/logs/maestro", tone: "neutral" },
          { label: "Diagnostics stream", value: "{otto.dataDir}/diagnostics/maestro", tone: "neutral" }
        ],
        modules,
        updates,
        events,
        render: { timeline: false, modules: false, events: true }
      };
    case "telemetry":
      return {
        cards: [
          ...baseCards,
          { label: "Telemetry path", value: "{otto.dataDir}/telemetry/maestro", tone: "neutral" },
          { label: "Trace path", value: "{otto.dataDir}/traces/maestro", tone: "neutral" },
          { label: "Signal health", value: degradedStages.length > 0 ? "Degraded" : "Healthy", tone: degradedStages.length > 0 ? "warning" : "success" }
        ],
        modules,
        updates,
        events,
        render: { timeline: true, modules: false, events: true }
      };
    default:
      return {
        cards: baseCards,
        modules,
        updates,
        events,
        render: { timeline: false, modules: false, events: true }
      };
  }
}
