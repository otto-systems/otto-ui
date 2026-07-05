export const commandServiceSource = "@otto/command-service";

export const nodeGraphCommandRouting: Record<string, string> = {
  "pipeline.node": "service.status",
  "tool.node": "config.show",
  "agent.node": "service.start",
  "review.node": "service.stop"
};

export const uiCommandCatalog = [
  "config.show",
  "config.set",
  "service.install",
  "service.start",
  "service.status",
  "service.stop",
  "service.uninstall",
  "maestro.install",
  "maestro.update",
  "maestro.repair",
  "maestro.uninstall"
] as const;

export function resolveNodeGraphCommand(nodeType: string): string | undefined {
  return nodeGraphCommandRouting[nodeType];
}
