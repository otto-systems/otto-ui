import { commandServiceSource, resolveNodeGraphCommand } from "./commandRoutingService";

export function getModules() {
  return [
    {
      id: "core.shell",
      name: "Core Shell",
      version: "0.2.1",
      state: "ready",
      routedCommand: resolveNodeGraphCommand("pipeline.node"),
      commandSource: commandServiceSource
    },
    {
      id: "ext.sync",
      name: "Sync Extension",
      version: "0.2.1",
      state: "loaded",
      routedCommand: resolveNodeGraphCommand("tool.node"),
      commandSource: commandServiceSource
    },
    {
      id: "ext.audit",
      name: "Audit Extension",
      version: "0.2.1",
      state: "idle",
      routedCommand: resolveNodeGraphCommand("review.node"),
      commandSource: commandServiceSource
    }
  ];
}
