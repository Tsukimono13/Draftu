import { useEffect, useRef } from "react";
import { useAppDispatch } from "../store/hooks";
import { calendarActions } from "../store/slices/calendarSlice";
import { store } from "../store/store";
import { writeRoomState, subscribeToRoom, loadRoomState } from "../firebase/roomService";

export function useRoomSync(roomId: string | null) {
  const dispatch = useAppDispatch();
  const skipNextWrite = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    loadRoomState(roomId).then((state) => {
      if (cancelled) return;
      if (state) {
        skipNextWrite.current = true;
        dispatch(calendarActions.replaceState(state));
      } else {
        writeRoomState(roomId, store.getState().calendar);
      }
    });

    const unsubFirebase = subscribeToRoom(roomId, (state) => {
      skipNextWrite.current = true;
      dispatch(calendarActions.replaceState(state));
    });

    const unsubStore = store.subscribe(() => {
      if (skipNextWrite.current) {
        skipNextWrite.current = false;
        return;
      }
      if (writeTimer.current) clearTimeout(writeTimer.current);
      writeTimer.current = setTimeout(() => {
        writeRoomState(roomId, store.getState().calendar);
      }, 300);
    });

    return () => {
      cancelled = true;
      unsubFirebase();
      unsubStore();
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [roomId, dispatch]);
}
