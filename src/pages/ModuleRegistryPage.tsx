import { ModuleList } from "../components/ModuleList";
import { getModules } from "../services/moduleRegistryService";

export function ModuleRegistryPage() {
  const modules = getModules();

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Modules</p>
        <h2>Registry</h2>
        <p>Inspect installed modules, lifecycle readiness, and manifest versions.</p>
      </header>
      <ModuleList modules={modules} />
    </section>
  );
}
