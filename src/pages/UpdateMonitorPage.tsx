import { UpdateTimeline } from "../components/UpdateTimeline";
import { getUpdates } from "../services/updateService";

export function UpdateMonitorPage() {
  const updates = getUpdates();

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Updates</p>
        <h2>Monitor</h2>
        <p>Review the active channel, target version, and the latest update decisions.</p>
      </header>
      <UpdateTimeline updates={updates} />
    </section>
  );
}
