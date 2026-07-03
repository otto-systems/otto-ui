type StatusCardProps = {
  label: string;
  value: string;
  tone: "neutral" | "success" | "warning";
};

export function StatusCard({ label, value, tone }: StatusCardProps) {
  return (
    <article className={`status-card tone-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
