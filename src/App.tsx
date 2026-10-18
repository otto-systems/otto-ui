import { useEffect, useMemo, useState } from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { MaestroModulePage } from "./pages/MaestroModulePage";
import { ModuleRegistryPage } from "./pages/ModuleRegistryPage";
import { UpdateMonitorPage } from "./pages/UpdateMonitorPage";
import { getMaestroPageNavigation, loadBootstrapStatus, loadMaestroContracts } from "./services/maestroContractService";
import type { BootstrapStatusResult, MaestroContractsLoadResult } from "./types/ottoApi";

type View = "dashboard" | "modules" | "updates" | "maestro";

interface NavItem {
  id: string;
  label: string;
  route?: string;
}

const baseNavigation: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "modules", label: "Modules" },
  { id: "updates", label: "Updates" },
  { id: "maestro", label: "Maestro" }
];

export default function App() {
  const [view, setView] = useState<string>("dashboard");
  const [maestroContracts, setMaestroContracts] = useState<MaestroContractsLoadResult | null>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatusResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMaestroContracts().then((contracts) => {
      if (!cancelled) {
        setMaestroContracts(contracts);
      }
    });
    loadBootstrapStatus().then((status) => {
      if (!cancelled) {
        setBootstrapStatus(status);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const navigation = useMemo<NavItem[]>(() => {
    const contractPages = getMaestroPageNavigation(maestroContracts).map((page) => ({
      id: `maestro:${page.id}`,
      label: `Maestro · ${page.label}`,
      route: page.route
    }));
    return [...baseNavigation, ...contractPages];
  }, [maestroContracts]);

  const activeMaestroRoute = useMemo(() => {
    const selectedItem = navigation.find((item) => item.id === view);
    return selectedItem?.route;
  }, [navigation, view]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Otto System</p>
          <h1>Operator Console</h1>
          <p className="sidebar-copy">Local-first control surface for kernel, modules, commands, and updates.</p>
        </div>
        <nav className="nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === view ? "nav-button active" : "nav-button"}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        {view === "dashboard" ? <DashboardPage /> : null}
        {view === "modules" ? <ModuleRegistryPage /> : null}
        {view === "updates" ? <UpdateMonitorPage /> : null}
        {view === "maestro" || view.startsWith("maestro:") ? (
          <MaestroModulePage contracts={maestroContracts} selectedRoute={activeMaestroRoute} bootstrapStatus={bootstrapStatus} />
        ) : null}
      </main>
    </div>
  );
}
