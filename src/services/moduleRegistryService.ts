export function getModules() {
  return [
    { id: "core.shell", name: "Core Shell", version: "0.2.0", state: "ready" },
    { id: "ext.sync", name: "Sync Extension", version: "0.2.0", state: "loaded" },
    { id: "ext.audit", name: "Audit Extension", version: "0.2.0", state: "idle" }
  ];
}
