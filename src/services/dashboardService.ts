import { commandServiceSource, uiCommandCatalog } from "./commandRoutingService";

export function getSystemSummary() {
  return [
    { label: "Kernel", value: "Healthy", tone: "success" as const },
    { label: "Command queue", value: "3 pending", tone: "warning" as const },
    { label: "Command source", value: commandServiceSource, tone: "neutral" as const },
    { label: "Routed commands", value: String(uiCommandCatalog.length), tone: "neutral" as const },
    { label: "Update channel", value: "stable", tone: "neutral" as const }
  ];
}
