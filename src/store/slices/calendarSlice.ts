import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CalendarState, ContentType, ContentStatus } from "../types";
import { createContentItem } from "../../utils/contentHelpers";
import { generateId } from "../../utils/idHelpers";
import { today } from "../../utils/dateHelpers";

const now = () => new Date().toISOString();

const defaultState: CalendarState = {
  days: {},
  selectedDate: today(),
  notes: [],
  hashtagSets: [],
  lastUpdated: null,
};

function findItem(state: CalendarState, date: string, itemId: string) {
  const day = state.days[date];
  if (!day) return null;
  return day.items.find((i) => i.id === itemId) ?? null;
}

const calendarSlice = createSlice({
  name: "calendar",
  initialState: defaultState,
  reducers: {
    selectDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },

    addItem: {
      reducer(
        state,
        action: PayloadAction<{ date: string; item: ReturnType<typeof createContentItem> }>,
      ) {
        const { date, item } = action.payload;
        if (!state.days[date]) {
          state.days[date] = { date, items: [] };
        }
        state.days[date].items.push(item);
        state.lastUpdated = now();
      },
      prepare(date: string, type: ContentType) {
        return { payload: { date, item: createContentItem(type) } };
      },
    },

    updateItemText(
      state,
      action: PayloadAction<{ date: string; itemId: string; text: string }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item) {
        item.text = action.payload.text;
        state.lastUpdated = now();
      }
    },

    updateItemStatus(
      state,
      action: PayloadAction<{ date: string; itemId: string; status: ContentStatus }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item) {
        item.status = action.payload.status;
        state.lastUpdated = now();
      }
    },

    updateItemTime(
      state,
      action: PayloadAction<{ date: string; itemId: string; time: string | null }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item) {
        item.time = action.payload.time;
        state.lastUpdated = now();
      }
    },

    addItemImage(
      state,
      action: PayloadAction<{ date: string; itemId: string; image: string }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item) {
        if (!item.images) item.images = [];
        item.images.push(action.payload.image);
        state.lastUpdated = now();
      }
    },

    removeItemImage(
      state,
      action: PayloadAction<{ date: string; itemId: string; index: number }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item?.images) {
        item.images.splice(action.payload.index, 1);
        state.lastUpdated = now();
      }
    },

    toggleItemPinned(
      state,
      action: PayloadAction<{ date: string; itemId: string }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item) {
        item.pinned = !item.pinned;
        if (!item.pinned) item.highlight = undefined;
        state.lastUpdated = now();
      }
    },

    updateItemHighlight(
      state,
      action: PayloadAction<{ date: string; itemId: string; highlight: string }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item) {
        item.highlight = action.payload.highlight || undefined;
        state.lastUpdated = now();
      }
    },

    reorderItem(
      state,
      action: PayloadAction<{ date: string; itemId: string; toIndex: number }>,
    ) {
      const day = state.days[action.payload.date];
      if (!day) return;
      const fromIndex = day.items.findIndex((i) => i.id === action.payload.itemId);
      if (fromIndex === -1 || fromIndex === action.payload.toIndex) return;
      const [moved] = day.items.splice(fromIndex, 1);
      day.items.splice(action.payload.toIndex, 0, moved);
      state.lastUpdated = now();
    },

    deleteItem(
      state,
      action: PayloadAction<{ date: string; itemId: string }>,
    ) {
      const day = state.days[action.payload.date];
      if (!day) return;
      day.items = day.items.filter((i) => i.id !== action.payload.itemId);
      if (day.items.length === 0) {
        delete state.days[action.payload.date];
      }
      state.lastUpdated = now();
    },

    updateItemTag(
      state,
      action: PayloadAction<{ date: string; itemId: string; tag: string | undefined }>,
    ) {
      const item = findItem(state, action.payload.date, action.payload.itemId);
      if (item) {
        item.tag = action.payload.tag;
        state.lastUpdated = now();
      }
    },

    duplicateItem(
      state,
      action: PayloadAction<{ fromDate: string; itemId: string; toDate: string }>,
    ) {
      const srcItem = findItem(state, action.payload.fromDate, action.payload.itemId);
      if (!srcItem) return;
      const clone = {
        ...JSON.parse(JSON.stringify(srcItem)),
        id: generateId("c"),
        status: "planned" as const,
        createdAt: now(),
      };
      if (!state.days[action.payload.toDate]) {
        state.days[action.payload.toDate] = { date: action.payload.toDate, items: [] };
      }
      state.days[action.payload.toDate].items.push(clone);
      state.lastUpdated = now();
    },

    moveItem(
      state,
      action: PayloadAction<{ fromDate: string; itemId: string; toDate: string }>,
    ) {
      const { fromDate, itemId, toDate } = action.payload;
      if (fromDate === toDate) return;
      const srcDay = state.days[fromDate];
      if (!srcDay) return;
      const idx = srcDay.items.findIndex((i) => i.id === itemId);
      if (idx === -1) return;
      const [item] = srcDay.items.splice(idx, 1);
      if (srcDay.items.length === 0) delete state.days[fromDate];
      if (!state.days[toDate]) {
        state.days[toDate] = { date: toDate, items: [] };
      }
      state.days[toDate].items.push(item);
      state.lastUpdated = now();
    },

    addNote(state) {
      state.notes.push({
        id: generateId("n"),
        text: "",
        createdAt: now(),
      });
      state.lastUpdated = now();
    },

    updateNote(
      state,
      action: PayloadAction<{ noteId: string; text: string }>,
    ) {
      const note = state.notes.find((n) => n.id === action.payload.noteId);
      if (note) {
        note.text = action.payload.text;
        state.lastUpdated = now();
      }
    },

    deleteNote(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter((n) => n.id !== action.payload);
      state.lastUpdated = now();
    },

    addHashtagSet(state, action: PayloadAction<{ name: string; tags: string }>) {
      state.hashtagSets = state.hashtagSets ?? [];
      state.hashtagSets.push({
        id: generateId("h"),
        name: action.payload.name,
        tags: action.payload.tags,
      });
      state.lastUpdated = now();
    },

    updateHashtagSet(
      state,
      action: PayloadAction<{ id: string; name: string; tags: string }>,
    ) {
      const sets = state.hashtagSets ?? [];
      const set = sets.find((s) => s.id === action.payload.id);
      if (set) {
        set.name = action.payload.name;
        set.tags = action.payload.tags;
        state.lastUpdated = now();
      }
    },

    deleteHashtagSet(state, action: PayloadAction<string>) {
      state.hashtagSets = (state.hashtagSets ?? []).filter((s) => s.id !== action.payload);
      state.lastUpdated = now();
    },

    resetCalendar(state) {
      state.days = {};
      state.notes = [];
      state.hashtagSets = [];
      state.selectedDate = today();
      state.lastUpdated = now();
    },

    replaceState(_state, action: PayloadAction<CalendarState>) {
      return action.payload;
    },
  },
});

export const calendarActions = calendarSlice.actions;
export { calendarSlice };
