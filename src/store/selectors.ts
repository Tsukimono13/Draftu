import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./types";

export const selectSelectedDate = (state: RootState) =>
  state.calendar.selectedDate;

export const selectDays = (state: RootState) => state.calendar.days;

const dayItemsCache = new Map<string, (state: RootState) => RootState["calendar"]["days"][string]["items"]>();

export const selectDayItems = (date: string) => {
  let selector = dayItemsCache.get(date);
  if (!selector) {
    selector = createSelector(
      (state: RootState) => state.calendar.days[date],
      (day) => day?.items ?? [],
    );
    dayItemsCache.set(date, selector);
  }
  return selector;
};

export const selectNotes = (state: RootState) => state.calendar.notes ?? [];

export const selectHighlightNames = createSelector(
  (state: RootState) => state.calendar.days,
  (days) => {
    const names = new Set<string>();
    for (const day of Object.values(days)) {
      for (const item of day.items) {
        if (item.highlight) names.add(item.highlight);
      }
    }
    return Array.from(names).sort();
  },
);

export const selectWeekItemCount = createSelector(
  (state: RootState) => state.calendar.days,
  (_state: RootState, weekDays: string[]) => weekDays,
  (days, weekDays) => {
    let count = 0;
    for (const date of weekDays) {
      count += days[date]?.items?.length ?? 0;
    }
    return count;
  },
);

export interface WeekSummaryDay {
  date: string;
  counts: Record<string, number>;
  total: number;
}

export const selectWeekSummary = createSelector(
  (state: RootState) => state.calendar.days,
  (_state: RootState, weekDays: string[]) => weekDays,
  (days, weekDays): WeekSummaryDay[] =>
    weekDays.map((date) => {
      const items = days[date]?.items ?? [];
      const counts: Record<string, number> = {};
      for (const item of items) {
        counts[item.type] = (counts[item.type] ?? 0) + 1;
      }
      return { date, counts, total: items.length };
    }),
);

export const selectHashtagSets = (state: RootState) =>
  state.calendar.hashtagSets ?? [];

export const selectDragItem = (state: RootState) => state.drag.item;

export const selectToastMessage = (state: RootState) => state.ui.toastMessage;
