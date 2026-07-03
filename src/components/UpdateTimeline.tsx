type UpdateRecord = {
  id: string;
  label: string;
  status: string;
  detail: string;
};

type UpdateTimelineProps = {
  updates: UpdateRecord[];
};

export function UpdateTimeline({ updates }: UpdateTimelineProps) {
  return (
    <div className="timeline">
      {updates.map((update) => (
        <article key={update.id} className="timeline-item">
          <p className="item-title">{update.label}</p>
          <p className="item-subtitle">{update.detail}</p>
          <span className="pill">{update.status}</span>
        </article>
      ))}
    </div>
  );
}
