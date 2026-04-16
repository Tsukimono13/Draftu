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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { calendarActions } from "../store/slices/calendarSlice";
import { uiActions } from "../store/slices/uiSlice";
import { selectSelectedDate, selectWeekItemCount, selectWeekSummary, selectToastMessage } from "../store/selectors";
import { setStorageErrorHandler } from "../store/store";
import { createShareHash } from "../utils/encoding";
import { getWeekDays } from "../utils/dateHelpers";

export function MainPage() {
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector(selectSelectedDate);
  const toastMsg = useAppSelector(selectToastMessage);
  const calendarState = useAppSelector((state) => state.calendar);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const weekCount = useAppSelector((state) => selectWeekItemCount(state, weekDays));
  const weekSummary = useAppSelector((state) => selectWeekSummary(state, weekDays));

  const [statusMsg, setStatusMsg] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.length > 1) {
      showStatus("Загружено из общей ссылки. Все изменения сохраняются локально.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCopyLink = async () => {
    try {
      const shareHash = createShareHash(calendarState);
      const shareLink = `${window.location.origin}${window.location.pathname}${shareHash}`;
      await navigator.clipboard.writeText(shareLink);
      window.history.replaceState(null, "", shareHash);
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
    if (typeof window !== "undefined") {
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
      <Calendar />
      <DayPanel key={selectedDate} />
      <GridPreview />
      <HashtagManager />
      <NotesPanel />
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
