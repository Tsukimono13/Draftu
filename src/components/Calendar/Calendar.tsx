import { useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectDays, selectSelectedDate, selectDragItem } from "../../store/selectors";
import { calendarActions } from "../../store/slices/calendarSlice";
import { parseDate, getWeekDays, getMonthGrid, getMonday, isSameMonth, today } from "../../utils/dateHelpers";
import { WEEKDAY_NAMES, MONTH_NAMES } from "../../utils/constants";
import { DayCell } from "./DayCell";
import styles from "./Calendar.module.scss";

export function Calendar() {
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector(selectSelectedDate);
  const days = useAppSelector(selectDays);
  const dragItem = useAppSelector(selectDragItem);
  const todayKey = today();

  const currentDate = parseDate(selectedDate);
  const [viewMonth, setViewMonth] = useState(false);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const monthGrid = useMemo(
    () => getMonthGrid(displayYear, displayMonth),
    [displayYear, displayMonth],
  );

  const navigateMonth = (delta: number) => {
    let m = displayMonth + delta;
    let y = displayYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setDisplayMonth(m);
    setDisplayYear(y);
  };

  const navigateWeek = (delta: number) => {
    const monday = getMonday(selectedDate);
    const d = parseDate(monday);
    d.setDate(d.getDate() + delta * 7);
    const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dispatch(calendarActions.selectDate(newDate));
  };

  const renderDayCell = (dateKey: string, isCurrentMonth: boolean) => (
    <DayCell
      key={dateKey}
      dateKey={dateKey}
      items={days[dateKey]?.items ?? []}
      isSelected={dateKey === selectedDate}
      isToday={dateKey === todayKey}
      isCurrentMonth={isCurrentMonth}
      dragItemDate={dragItem?.date ?? null}
      dragItemId={dragItem?.itemId ?? null}
    />
  );

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        {viewMonth ? (
          <>
            <button className={styles.navBtn} onClick={() => navigateMonth(-1)}>←</button>
            <button className={styles.monthTitle} onClick={() => setViewMonth(false)}>
              {MONTH_NAMES[displayMonth]} {displayYear}
            </button>
            <button className={styles.navBtn} onClick={() => navigateMonth(1)}>→</button>
          </>
        ) : (
          <>
            <button className={styles.navBtn} onClick={() => navigateWeek(-1)}>←</button>
            <button
              className={styles.monthTitle}
              onClick={() => {
                const d = parseDate(selectedDate);
                setDisplayYear(d.getFullYear());
                setDisplayMonth(d.getMonth());
                setViewMonth(true);
              }}
            >
              {MONTH_NAMES[parseDate(selectedDate).getMonth()]}{" "}
              {parseDate(selectedDate).getFullYear()}
            </button>
            <button className={styles.navBtn} onClick={() => navigateWeek(1)}>→</button>
          </>
        )}
        <button
          className={styles.todayBtn}
          onClick={() => {
            dispatch(calendarActions.selectDate(todayKey));
            const d = new Date();
            setDisplayYear(d.getFullYear());
            setDisplayMonth(d.getMonth());
          }}
        >
          Сегодня
        </button>
      </div>

      <div className={styles.weekdayRow}>
        {WEEKDAY_NAMES.map((name) => (
          <span key={name} className={styles.weekdayName}>{name}</span>
        ))}
      </div>

      {viewMonth ? (
        <div className={styles.monthGrid}>
          {monthGrid.map((week, wi) => (
            <div key={wi} className={styles.weekRow}>
              {week.map((dateKey) => renderDayCell(dateKey, isSameMonth(dateKey, displayYear, displayMonth)))}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.weekRow}>
          {weekDays.map((dateKey) => renderDayCell(dateKey, true))}
        </div>
      )}
    </div>
  );
}
