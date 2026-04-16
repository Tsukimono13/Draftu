import type { PayloadAction } from "@reduxjs/toolkit";

export type ContentType = "post" | "story" | "reels" | "carousel";

export type ContentStatus = "planned" | "ready" | "published";

export interface ContentItem {
  id: string;
  type: ContentType;
  text: string;
  status: ContentStatus;
  time: string | null;
  images: string[];
  pinned?: boolean;
  highlight?: string;
  tag?: string;
  createdAt: string;
}

export interface DayEntry {
  date: string;
  items: ContentItem[];
}

export interface GeneralNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface HashtagSet {
  id: string;
  name: string;
  tags: string;
}

export interface CalendarState {
  days: Record<string, DayEntry>;
  selectedDate: string;
  notes: GeneralNote[];
  hashtagSets: HashtagSet[];
  lastUpdated: string | null;
}

export type RootState = {
  calendar: CalendarState;
  drag: { item: { date: string; itemId: string } | null };
  ui: { toastMessage: string };
};

export type AppDispatch = import("@reduxjs/toolkit").ThunkDispatch<
  RootState,
  undefined,
  PayloadAction<unknown>
>;
