"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SearchStore = {
  isOpen: boolean;
  query: string;
  history: string[];
  open: () => void;
  close: () => void;
  setQuery: (query: string) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      isOpen: false,
      query: "",
      history: [],

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false, query: "" }),
      setQuery: (query) => set({ query }),

      addToHistory: (query) => {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 2) return;
        set((state) => ({
          history: [
            trimmed,
            ...state.history.filter((h) => h !== trimmed),
          ].slice(0, 8),
        }));
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "veloire-search",
      partialize: (state) => ({ history: state.history }),
    }
  )
);
