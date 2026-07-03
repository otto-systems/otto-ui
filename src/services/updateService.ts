export function getUpdates() {
  return [
    { id: "update-1", label: "Current release", status: "applied", detail: "0.2.0 is active on stable." },
    { id: "update-2", label: "Next candidate", status: "queued", detail: "0.2.0 is staged for review." },
    { id: "update-3", label: "Rollback snapshot", status: "available", detail: "Previous state retained locally." }
  ];
}
