import { StatusCard } from "../components/StatusCard";
import { getSystemSummary } from "../services/dashboardService";

export function DashboardPage() {
  const summary = getSystemSummary();

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Dashboard</p>
        <h2>System overview</h2>
        <p>Track kernel health, command flow, and update posture from one place.</p>
      </header>
      <div className="card-grid">
        {summary.map((item) => (
          <StatusCard key={item.label} label={item.label} value={item.value} tone={item.tone} />
        ))}
      </div>
    </section>
  );
}
