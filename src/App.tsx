import { useState } from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { ModuleRegistryPage } from "./pages/ModuleRegistryPage";
import { UpdateMonitorPage } from "./pages/UpdateMonitorPage";

type View = "dashboard" | "modules" | "updates";

const navigation: Array<{ id: View; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "modules", label: "Modules" },
  { id: "updates", label: "Updates" }
];

export default function App() {
  const [view, setView] = useState<View>("dashboard");

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
      </main>
    </div>
  );
}
