import { create } from 'zustand';

import type { UpdateConfig } from '../../shared/types';

export type DeferOptionSeconds = 3600 | 14400 | 86400 | 604800;

interface UiState {
  settingsOpen: boolean;
  selectedDeferSeconds: DeferOptionSeconds;
  configDraft: UpdateConfig | null;
  setSettingsOpen: (open: boolean) => void;
  setSelectedDeferSeconds: (seconds: DeferOptionSeconds) => void;
  setConfigDraft: (config: UpdateConfig) => void;
  patchConfigDraft: (patch: Partial<UpdateConfig>) => void;
}

export const useUiStore = create<UiState>((set) => ({
  settingsOpen: false,
  selectedDeferSeconds: 3600,
  configDraft: null,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setSelectedDeferSeconds: (seconds) => set({ selectedDeferSeconds: seconds }),
  setConfigDraft: (config) => set({ configDraft: config }),
  patchConfigDraft: (patch) =>
    set((state) => {
      if (!state.configDraft) {
        return state;
      }

      return {
        configDraft: {
          ...state.configDraft,
          ...patch,
        },
      };
    }),
}));
