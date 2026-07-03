export function getSystemSummary() {
  return [
    { label: "Kernel", value: "Healthy", tone: "success" as const },
    { label: "Command queue", value: "3 pending", tone: "warning" as const },
    { label: "Update channel", value: "stable", tone: "neutral" as const }
  ];
}
