import { memo } from "react";
import { useAppDispatch } from "../../store/hooks";
import { calendarActions } from "../../store/slices/calendarSlice";
import { dragActions } from "../../store/slices/dragSlice";
import { parseDate } from "../../utils/dateHelpers";
import { CONTENT_TYPE_ICON } from "../../utils/constants";
import type { ContentItem } from "../../store/types";
import styles from "./Calendar.module.scss";

interface DayCellProps {
  dateKey: string;
  items: ContentItem[];
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  dragItemDate: string | null;
  dragItemId: string | null;
}

export const DayCell = memo(function DayCell({
  dateKey,
  items,
  isSelected,
  isToday,
  isCurrentMonth,
  dragItemDate,
  dragItemId,
}: DayCellProps) {
  const dispatch = useAppDispatch();

  const classes = [
    styles.dayCell,
    isSelected && styles.selected,
    isToday && styles.today,
    !isCurrentMonth && styles.otherMonth,
  ]
    .filter(Boolean)
    .join(" ");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragOver);
    if (dragItemDate && dragItemId && dragItemDate !== dateKey) {
      dispatch(calendarActions.moveItem({ fromDate: dragItemDate, itemId: dragItemId, toDate: dateKey }));
      dispatch(dragActions.endDrag());
    }
  };

  return (
    <button
      className={classes}
      onClick={() => dispatch(calendarActions.selectDate(dateKey))}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add(styles.dragOver);
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove(styles.dragOver);
      }}
      onDrop={handleDrop}
    >
      <span className={styles.dayNumber}>{parseDate(dateKey).getDate()}</span>
      {items.length > 0 && (
        <span className={styles.dayIcons}>
          {items.slice(0, 3).map((item) => (
            <span key={item.id} className={styles.dayIcon} title={item.type}>
              {CONTENT_TYPE_ICON[item.type]}
            </span>
          ))}
          {items.length > 3 && (
            <span className={styles.dayMore}>+{items.length - 3}</span>
          )}
        </span>
      )}
    </button>
  );
});
