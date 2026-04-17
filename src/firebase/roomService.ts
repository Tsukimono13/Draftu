import { ref, set, get, onValue } from "firebase/database";
import { db } from "./config";
import type { CalendarState, DayEntry } from "../store/types";

const SESSION_ID = Math.random().toString(36).slice(2, 10);

interface RoomData {
  state: CalendarState;
  writerId: string;
  updatedAt: number;
}

export function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

function toArray<T>(val: T[] | Record<string, T> | undefined | null): T[] {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  return [];
}

/** Firebase strips empty arrays and may convert arrays to objects.
 *  This normalizes the state back to the expected shape. */
function normalizeState(raw: CalendarState): CalendarState {
  const days: Record<string, DayEntry> = {};
  if (raw.days) {
    for (const [date, day] of Object.entries(raw.days)) {
      days[date] = {
        date,
        items: toArray(day.items).map((item) => ({
          ...item,
          images: toArray(item.images),
        })),
      };
    }
  }
  return {
    days,
    selectedDate: raw.selectedDate,
    notes: toArray(raw.notes),
    hashtagSets: toArray(raw.hashtagSets),
    lastUpdated: raw.lastUpdated,
  };
}

export async function writeRoomState(roomId: string, state: CalendarState): Promise<void> {
  if (!db) return;
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    await set(roomRef, {
      state,
      writerId: SESSION_ID,
      updatedAt: Date.now(),
    } satisfies RoomData);
  } catch (e) {
    console.error("Firebase write error:", e);
  }
}

export async function loadRoomState(roomId: string): Promise<CalendarState | null> {
  if (!db) return null;
  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.val() as RoomData;
    return normalizeState(data.state);
  } catch (e) {
    console.error("Firebase read error:", e);
    return null;
  }
}

export function subscribeToRoom(
  roomId: string,
  onUpdate: (state: CalendarState) => void,
): () => void {
  if (!db) return () => {};
  const roomRef = ref(db, `rooms/${roomId}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.val() as RoomData;
    if (data.writerId === SESSION_ID) return;
    onUpdate(normalizeState(data.state));
  });
  return unsubscribe;
}
