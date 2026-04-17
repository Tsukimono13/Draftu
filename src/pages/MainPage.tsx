import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "../components/Header/Header";
import { Calendar } from "../components/Calendar/Calendar";
import { DayPanel } from "../components/DayPanel/DayPanel";
import { NotesPanel } from "../components/NotesPanel/NotesPanel";
import { GridPreview } from "../components/GridPreview/GridPreview";
import { HashtagManager } from "../components/HashtagManager/HashtagManager";
import { Toast } from "../components/Toast/Toast";
import { StatusNotification } from "../components/StatusNotification/StatusNotification";
import { ConfirmModal } from "../components/ConfirmModal/ConfirmModal";
import { RoomBar } from "../components/RoomBar/RoomBar";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { calendarActions } from "../store/slices/calendarSlice";
import { uiActions } from "../store/slices/uiSlice";
import { selectSelectedDate, selectWeekItemCount, selectWeekSummary, selectToastMessage } from "../store/selectors";
import { setStorageErrorHandler } from "../store/store";
import { createShareHash } from "../utils/encoding";
import { getWeekDays } from "../utils/dateHelpers";
import { useRoomSync } from "../hooks/useRoomSync";

function getRoomFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("room");
}

export function MainPage() {
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector(selectSelectedDate);
  const toastMsg = useAppSelector(selectToastMessage);
  const calendarState = useAppSelector((state) => state.calendar);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const weekCount = useAppSelector((state) => selectWeekItemCount(state, weekDays));
  const weekSummary = useAppSelector((state) => selectWeekSummary(state, weekDays));

  const hasHash = typeof window !== "undefined" && window.location.hash.length > 1;
  const [statusMsg, setStatusMsg] = useState(
    hasHash ? "Загружено из общей ссылки. Все изменения сохраняются локально." : "",
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(getRoomFromUrl);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const roomLoading = useRoomSync(roomId);

  // Auto-dismiss initial status
  useEffect(() => {
    if (hasHash) {
      timerRef.current = setTimeout(() => setStatusMsg(""), 4000);
    }
  }, [hasHash]);

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatusMsg(""), 4000);
  };

  const showError = useCallback(
    (msg: string) => dispatch(uiActions.showToast(msg)),
    [dispatch],
  );

  useEffect(() => {
    setStorageErrorHandler(showError);
  }, [showError]);

  const updateRoomUrl = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set("room", id);
    } else {
      url.searchParams.delete("room");
    }
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
  };

  const handleCreateRoom = (id: string) => {
    setRoomId(id);
    updateRoomUrl(id);
    showStatus(`Комната создана: ${id}`);
  };

  const handleJoinRoom = (id: string) => {
    setRoomId(id);
    updateRoomUrl(id);
    showStatus(`Подключено к комнате: ${id}`);
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    updateRoomUrl(null);
    showStatus("Вы вышли из комнаты");
  };

  const handleCopyLink = async () => {
    try {
      if (roomId) {
        const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        await navigator.clipboard.writeText(url);
      } else {
        const shareHash = createShareHash(calendarState);
        const shareLink = `${window.location.origin}${window.location.pathname}${shareHash}`;
        await navigator.clipboard.writeText(shareLink);
        window.history.replaceState(null, "", shareHash);
      }
      showStatus("Ссылка скопирована");
    } catch {
      showStatus("Не удалось скопировать ссылку");
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    dispatch(calendarActions.resetCalendar());
    if (typeof window !== "undefined" && !roomId) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    showStatus("План очищен");
  };

  return (
    <>
      <Header
        weekCount={weekCount}
        weekSummary={weekSummary}
        onCopyLink={handleCopyLink}
        onReset={handleReset}
      />
      <RoomBar
        roomId={roomId}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onLeaveRoom={handleLeaveRoom}
      />
      {roomLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--c-text-placeholder)" }}>
          Загрузка комнаты...
        </div>
      ) : (
        <>
          <Calendar />
          <DayPanel key={selectedDate} />
          <GridPreview />
          <HashtagManager />
          <NotesPanel />
        </>
      )}
      {statusMsg && <StatusNotification message={statusMsg} />}
      {showResetConfirm && (
        <ConfirmModal
          title="Очистить план?"
          message="Все записи, заметки и хештеги будут удалены. Это действие нельзя отменить."
          confirmLabel="Очистить"
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
      {toastMsg && (
        <Toast message={toastMsg} onClose={() => dispatch(uiActions.clearToast())} />
      )}
    </>
  );
}
