import { ModuleList } from "../components/ModuleList";
import { StatusCard } from "../components/StatusCard";
import { UpdateTimeline } from "../components/UpdateTimeline";
import { getMaestroPanelBinding } from "../services/maestroPanelBindingService";
import type { BootstrapStatusResult, MaestroContractsLoadResult } from "../types/ottoApi";

interface MaestroModulePageProps {
  contracts: MaestroContractsLoadResult | null;
  selectedRoute?: string;
  bootstrapStatus: BootstrapStatusResult | null;
}

const panelDescriptions: Record<string, string> = {
  "install-status": "Inspect install and repair workflow readiness for Maestro deployment.",
  "runtime-status": "Monitor runtime health and process state for the Maestro stack.",
  "workflow-builder": "Build and inspect contract-driven workflow graphs and orchestration entry points.",
  "runtime-monitor": "Observe runtime run-state transitions and orchestration lifecycle health.",
  "registry-browser": "Browse discovered resources, capability tags, and selection policy readiness.",
  "node-graph": "Visualize active node graph topology and orchestration edges.",
  "execution-timeline": "Track ordered runtime event flow for continuity and recovery analysis.",
  diagnostics: "Inspect diagnostics and observability contract health across runtime and installer phases.",
  logs: "Review structured logs emitted by Maestro runtime and extension modules.",
  telemetry: "Track telemetry streams for operations, diagnostics, and performance signals."
};

export function MaestroModulePage({ contracts, selectedRoute, bootstrapStatus }: MaestroModulePageProps) {
  if (!contracts) {
    return (
      <section className="page">
        <header className="page-header">
          <p className="eyebrow">Maestro</p>
          <h2>Contract loading</h2>
          <p>Loading Maestro module registration and UI contract...</p>
        </header>
      </section>
    );
  }

  if (!contracts.ok || !contracts.registration || !contracts.uiContract) {
    return (
      <section className="page">
        <header className="page-header">
          <p className="eyebrow">Maestro</p>
          <h2>Contract loading failed</h2>
          <p>{contracts.error ?? "Unknown contract loading error."}</p>
          <p>Root: {contracts.maestroRoot}</p>
        </header>
      </section>
    );
  }

  const activePage =
    selectedRoute !== undefined ? contracts.uiContract.pages.find((page) => page.route === selectedRoute) : undefined;
  const panelBinding = activePage
    ? getMaestroPanelBinding({
        panel: activePage.panel,
        contracts,
        bootstrapStatus,
        selectedRoute
      })
    : undefined;

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Maestro</p>
        <h2>{activePage ? activePage.label : `${contracts.registration.displayName} module`}</h2>
        <p>
          {activePage
            ? panelDescriptions[activePage.panel] ?? "Contract-driven panel route from Maestro manifests."
            : "Contract-driven Otto UI registration loaded from local Maestro manifests."}
        </p>
      </header>
      {bootstrapStatus?.ok ? (
        <section className="page">
          <header className="page-header">
            <p className="eyebrow">Bootstrap status</p>
            <h2>{bootstrapStatus.degradedStages.length > 0 ? "Degraded local service stages detected" : "All bootstrap stages healthy"}</h2>
            <p>
              {bootstrapStatus.degradedStages.length > 0
                ? `Degraded stages: ${bootstrapStatus.degradedStages.join(", ")}`
                : "No degraded bootstrap stages reported."}
            </p>
          </header>
          {bootstrapStatus.degradedStages.length > 0 ? (
            <div className="pill-row">
              {bootstrapStatus.degradedStages.map((stage) => (
                <span key={stage} className="pill pill-warning">
                  {stage}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
      <div className="card-grid">
        {(panelBinding?.cards ?? [
          { label: "Entry route", value: contracts.registration.entryRoute, tone: "neutral" as const },
          { label: "Contract ID", value: contracts.uiContract.contractId, tone: "neutral" as const },
          { label: "Capabilities", value: String(contracts.registration.capabilities.length), tone: "neutral" as const }
        ]).map((card) => (
          <StatusCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </div>
      {panelBinding && activePage ? (
        <>
          {panelBinding.render.timeline ? (
            <section className="page">
              <header className="page-header">
                <p className="eyebrow">Panel stream</p>
                <h2>Lifecycle timeline</h2>
              </header>
              <UpdateTimeline updates={panelBinding.updates} />
            </section>
          ) : null}
          {panelBinding.render.modules ? (
            <section className="page">
              <header className="page-header">
                <p className="eyebrow">Panel modules</p>
                <h2>Feature wiring status</h2>
              </header>
              <ModuleList modules={panelBinding.modules} />
            </section>
          ) : null}
          {panelBinding.render.events ? (
            <section className="page">
              <header className="page-header">
                <p className="eyebrow">Panel events</p>
                <h2>Contract-derived signals</h2>
              </header>
              <div className="stacked-list">
                {panelBinding.events.map((event) => (
                  <article key={event.id} className="stacked-item">
                    <div>
                      <p className="item-title">{event.title}</p>
                      <p className="item-subtitle">{event.detail}</p>
                    </div>
                    <div className="item-meta">
                      <span>{event.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
      <section className="page">
        <header className="page-header">
          <p className="eyebrow">Pages</p>
          <h2>Registered routes</h2>
        </header>
        <ul>
          {contracts.uiContract.pages.map((page) => (
            <li key={page.id}>
              <strong>{page.label}</strong> — {page.route}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
