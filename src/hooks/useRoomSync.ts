import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { calendarActions } from "../store/slices/calendarSlice";
import { uiActions } from "../store/slices/uiSlice";
import { store } from "../store/store";
import { writeRoomState, subscribeToRoom, loadRoomState } from "../firebase/roomService";

export function useRoomSync(roomId: string | null) {
  const dispatch = useAppDispatch();
  const isRemoteUpdate = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [loading, setLoading] = useState(!!roomId);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    loadRoomState(roomId).then((state) => {
      if (cancelled) return;
      if (state) {
        isRemoteUpdate.current = true;
        dispatch(calendarActions.replaceState(state));
        setTimeout(() => { isRemoteUpdate.current = false; }, 50);
      } else {
        const current = store.getState().calendar;
        writeRoomState(roomId, current).then((ok) => {
          if (cancelled) return;
          if (!ok) {
            dispatch(uiActions.showToast("Не удалось создать комнату. Проверь подключение к Firebase."));
          }
        });
      }
      setLoading(false);
    });

    const unsubFirebase = subscribeToRoom(roomId, (state) => {
      isRemoteUpdate.current = true;
      dispatch(calendarActions.replaceState(state));
      setTimeout(() => { isRemoteUpdate.current = false; }, 50);
    });

    const unsubStore = store.subscribe(() => {
      if (isRemoteUpdate.current) return;
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

  return loading;
}
