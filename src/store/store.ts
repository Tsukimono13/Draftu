import { configureStore } from "@reduxjs/toolkit";
import { calendarSlice } from "./slices/calendarSlice";
import { dragSlice } from "./slices/dragSlice";
import { uiSlice } from "./slices/uiSlice";
import { STORAGE_KEY } from "../utils/constants";
import { parseShareHash } from "../utils/encoding";
import type { CalendarState } from "./types";

const loadSavedState = (): CalendarState | null => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<CalendarState>;
    if (!parsed || typeof parsed.days !== "object") return null;
    return { ...calendarSlice.getInitialState(), ...parsed };
  } catch {
    return null;
  }
};

const loadInitialCalendarState = (): CalendarState => {
  if (typeof window === "undefined") return calendarSlice.getInitialState();

  const hash = window.location.hash;
  if (hash) {
    const parsed = parseShareHash(hash);
    if (parsed) return parsed;
  }

  return loadSavedState() ?? calendarSlice.getInitialState();
};

export const store = configureStore({
  reducer: {
    calendar: calendarSlice.reducer,
    drag: dragSlice.reducer,
    ui: uiSlice.reducer,
  },
  preloadedState: {
    calendar: loadInitialCalendarState(),
  },
});

let onStorageError: ((msg: string) => void) | null = null;

export const setStorageErrorHandler = (handler: (msg: string) => void) => {
  onStorageError = handler;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

store.subscribe(() => {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().calendar));
    } catch {
      onStorageError?.(
        "Не хватает места в хранилище. Удали ненужные фото или видео.",
      );
    }
  }, 500);
});
