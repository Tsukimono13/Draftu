import type { WeekSummaryDay } from "../../store/selectors";
import { parseDate } from "../../utils/dateHelpers";
import {
  WEEKDAY_NAMES_FULL,
  MONTH_NAMES_GENITIVE,
  CONTENT_TYPE_ICON,
  CONTENT_TYPE_LABEL,
} from "../../utils/constants";
import type { ContentType } from "../../store/types";
import styles from "./Header.module.scss";

interface WeekPopupProps {
  weekSummary: WeekSummaryDay[];
}

const typeOrder: ContentType[] = ["post", "story", "reels", "carousel"];

const formatDay = (dateKey: string) => {
  const d = parseDate(dateKey);
  const wd = WEEKDAY_NAMES_FULL[d.getDay()].slice(0, 2);
  return `${wd}, ${d.getDate()} ${MONTH_NAMES_GENITIVE[d.getMonth()]}`;
};

export function WeekPopup({ weekSummary }: WeekPopupProps) {
  return (
    <div className={styles.popup}>
      <div className={styles.popupTitle}>Контент на неделю</div>
      {weekSummary.map((day) => (
        <div
          key={day.date}
          className={`${styles.popupRow} ${day.total === 0 ? styles.popupRowEmpty : ""}`}
        >
          <span className={styles.popupDay}>{formatDay(day.date)}</span>
          {day.total === 0 ? (
            <span className={styles.popupNone}>—</span>
          ) : (
            <span className={styles.popupIcons}>
              {typeOrder.map((type) =>
                day.counts[type] ? (
                  <span key={type} className={styles.popupChip} title={CONTENT_TYPE_LABEL[type]}>
                    {CONTENT_TYPE_ICON[type]} {day.counts[type]}
                  </span>
                ) : null,
              )}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
