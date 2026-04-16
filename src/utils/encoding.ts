import type { CalendarState } from "../store/types";

export const encodeBase64 = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return "";
  }
};

export const decodeBase64 = (str: string): string => {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return "";
  }
};

export const createShareHash = (state: CalendarState): string => {
  const json = JSON.stringify(state);
  const encoded = encodeBase64(json);
  return `#${encoded}`;
};

export const parseShareHash = (hash: string): CalendarState | null => {
  if (!hash.startsWith("#")) return null;
  try {
    const encoded = hash.slice(1);
    const json = decodeBase64(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};
