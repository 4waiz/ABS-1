"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FiltersState, LogEntry, LogType, SettingsState } from "@/types";
import { dayKey } from "@/lib/date";

const defaultFilters: FiltersState = {
  query: "",
  type: "all",
  range: "last7",
  tag: null,
};

const storageFallback = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  removeItems: () => {},
} as unknown as Storage;

const defaultSettings: SettingsState = {
  voiceEnabled: false,
  voiceLanguage: "en-US",
};

interface LogState {
  entries: LogEntry[];
  filters: FiltersState;
  standupMode: boolean;
  settings: SettingsState;
  addEntry: (input: {
    text: string;
    type: LogType;
    tags: string[];
    minutes?: number;
    mood?: number;
    detail?: string;
    day?: string;
  }) => void;
  removeEntry: (id: string) => void;
  setFilters: (next: Partial<FiltersState>) => void;
  clearFilters: () => void;
  setStandupMode: (value: boolean) => void;
  setSettings: (next: Partial<SettingsState>) => void;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      entries: [],
      filters: defaultFilters,
      standupMode: false,
      settings: defaultSettings,
      addEntry: (input) => {
        const now = new Date();
        const entry: LogEntry = {
          id: createId(),
          text: input.text.trim(),
          type: input.type,
          tags: input.tags,
          minutes: input.minutes,
          mood: input.mood,
          detail: input.detail?.trim() || undefined,
          createdAt: Date.now(),
          day: input.day ?? dayKey(now),
        };
        set({ entries: [entry, ...get().entries] });
      },
      removeEntry: (id) => {
        set({ entries: get().entries.filter((entry) => entry.id !== id) });
      },
      setFilters: (next) => {
        set({ filters: { ...get().filters, ...next } });
      },
      clearFilters: () => {
        set({ filters: defaultFilters });
      },
      setStandupMode: (value) => {
        set({ standupMode: value });
      },
      setSettings: (next) => {
        set({ settings: { ...get().settings, ...next } });
      },
    }),
    {
      name: "abs-daily-recall",
      storage: createJSONStorage(() => (typeof window === "undefined" ? storageFallback : localStorage)),
      partialize: (state) => ({
        entries: state.entries,
        filters: state.filters,
        standupMode: state.standupMode,
        settings: state.settings,
      }),
    }
  )
);
