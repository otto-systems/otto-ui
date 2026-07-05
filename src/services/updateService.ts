import { commandServiceSource } from "./commandRoutingService";

export function getUpdates() {
  return [
    {
      id: "update-1",
      label: "Current release",
      status: "applied",
      detail: "0.2.1 is active on stable.",
      command: "service.status",
      commandSource: commandServiceSource
    },
    {
      id: "update-2",
      label: "Next candidate",
      status: "queued",
      detail: "0.2.1 is staged for review.",
      command: "maestro.update",
      commandSource: commandServiceSource
    },
    {
      id: "update-3",
      label: "Rollback snapshot",
      status: "available",
      detail: "Previous state retained locally.",
      command: "maestro.repair",
      commandSource: commandServiceSource
    }
  ];
}
