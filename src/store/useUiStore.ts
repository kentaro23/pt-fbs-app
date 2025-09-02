export type UiState = {
  toast?: { title: string; description?: string; variant?: "default" | "destructive" } | null;
};

export type UiActions = {
  showToast: (toast: NonNullable<UiState["toast"]>) => void;
  clearToast: () => void;
};

import { create } from "zustand";

export const useUiStore = create<UiState & UiActions>((set) => ({
  toast: null,
  showToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
}));
