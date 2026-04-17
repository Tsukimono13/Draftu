import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectDayItems, selectSelectedDate, selectDragItem } from "../../store/selectors";
import { calendarActions } from "../../store/slices/calendarSlice";
import { ContentItemCard } from "../ContentItemCard/ContentItemCard";
import { parseDate, addDays, today } from "../../utils/dateHelpers";
import {
  CONTENT_TYPE_LABEL,
  CONTENT_TYPE_ICON,
  MONTH_NAMES_GENITIVE,
  WEEKDAY_NAMES_FULL,
} from "../../utils/constants";
import type { ContentType } from "../../store/types";
import styles from "./DayPanel.module.scss";

const contentTypes: ContentType[] = ["post", "story", "reels", "carousel"];

export function DayPanel() {
  const dispatch = useAppDispatch();
  const date = useAppSelector(selectSelectedDate);
  const items = useAppSelector(selectDayItems(date));
  const dragItem = useAppSelector(selectDragItem);

  const d = parseDate(date);
  const weekday = WEEKDAY_NAMES_FULL[d.getDay()];
  const dayLabel = `${d.getDate()} ${MONTH_NAMES_GENITIVE[d.getMonth()]}`;
  const isToday = date === today();

  return (
    <section className={styles.dayPanel}>
      <div className={styles.dayHeader}>
        <div className={styles.dayNav}>
          <button
            className={styles.dayNavBtn}
            onClick={() => dispatch(calendarActions.selectDate(addDays(date, -1)))}
            aria-label="Предыдущий день"
          >
            ←
          </button>
          <div className={styles.dayTitleGroup}>
            <h2 className={styles.dayTitle}>{weekday}, {dayLabel}</h2>
            {isToday && <span className={styles.todayTag}>сегодня</span>}
          </div>
          <button
            className={styles.dayNavBtn}
            onClick={() => dispatch(calendarActions.selectDate(addDays(date, 1)))}
            aria-label="Следующий день"
          >
            →
          </button>
        </div>
        <div className={styles.addButtons}>
          {contentTypes.map((type) => (
            <button
              key={type}
              className={styles.addBtn}
              onClick={() => dispatch(calendarActions.addItem(date, type))}
            >
              <span className={styles.addBtnIcon}>{CONTENT_TYPE_ICON[type]}</span>
              {CONTENT_TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p className={styles.emptyTitle}>Нет контента на этот день</p>
          <p className={styles.emptyHint}>
            Нажми на кнопку выше, чтобы запланировать пост, сторис, рилс или карусель
          </p>
        </div>
      ) : (
        <div className={styles.itemList}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className={styles.itemWrap}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragItem && dragItem.date === date && dragItem.itemId !== item.id) {
                  e.currentTarget.classList.add(styles.dropTarget);
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(styles.dropTarget);
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove(styles.dropTarget);
                if (dragItem && dragItem.date === date && dragItem.itemId !== item.id) {
                  dispatch(calendarActions.reorderItem({ date, itemId: dragItem.itemId, toIndex: index }));
                }
              }}
            >
              <ContentItemCard item={item} date={date} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
