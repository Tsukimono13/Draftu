import { ref, set, get, onValue } from "firebase/database";
import { db } from "./config";
import type { CalendarState } from "../store/types";

const SESSION_ID = Math.random().toString(36).slice(2, 10);

interface RoomData {
  state: CalendarState;
  writerId: string;
  updatedAt: number;
}

export function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function writeRoomState(roomId: string, state: CalendarState): Promise<void> {
  if (!db) return;
  const roomRef = ref(db, `rooms/${roomId}`);
  await set(roomRef, {
    state,
    writerId: SESSION_ID,
    updatedAt: Date.now(),
  } satisfies RoomData);
}

export async function loadRoomState(roomId: string): Promise<CalendarState | null> {
  if (!db) return null;
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.val() as RoomData;
  return data.state;
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
    onUpdate(data.state);
  });
  return unsubscribe;
}
