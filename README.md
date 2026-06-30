# Otto UI

Otto UI is the desktop interface for Otto.  
It provides a unified, human-friendly front end for interacting with the kernel, update engine, command service layer, and extensions.

## Responsibilities
- Display kernel status and system information
- Provide update controls and notifications
- Expose commands through a clean UI
- Load and display extension UIs
- Maintain a consistent design system across Otto

## Planned Structure
- `src/` – Tauri/Electron frontend code
- `src/backend/` – Rust backend glue for UI <-> kernel communication
- `design-system/` – shared components, tokens, and styles
- `docs/` – UI architecture, flows, and design guidelines
- `prompts/` – Copilot prompt packs for UI consistency
