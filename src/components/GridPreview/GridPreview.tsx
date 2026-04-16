import { useMemo, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectDays } from "../../store/selectors";
import { isVideo } from "../../utils/imageHelpers";
import { CONTENT_TYPE_ICON } from "../../utils/constants";
import { DetailModal } from "./DetailModal";
import type { ContentItem } from "../../store/types";
import styles from "./GridPreview.module.scss";

interface FeedPost {
  item: ContentItem;
  date: string;
}

export function GridPreview() {
  const days = useAppSelector(selectDays);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FeedPost | null>(null);

  const feedPosts = useMemo(() => {
    const posts: FeedPost[] = [];
    const sortedDates = Object.keys(days).sort();
    for (const date of sortedDates) {
      const day = days[date];
      for (const item of day.items) {
        if (item.type === "post" || item.type === "carousel") {
          posts.push({ item, date });
        }
      }
    }
    return posts;
  }, [days]);

  if (feedPosts.length === 0 && !open) return null;

  return (
    <section className={styles.wrapper}>
      <button className={styles.toggle} onClick={() => setOpen(!open)}>
        <span className={styles.toggleIcon}>{open ? "▾" : "▸"}</span>
        <span>Сетка профиля</span>
        {feedPosts.length > 0 && (
          <span className={styles.badge}>{feedPosts.length}</span>
        )}
      </button>

      <div className={open ? styles.bodyWrap : styles.bodyWrapClosed}>
        <div className={styles.bodyInner}>
          {feedPosts.length === 0 ? (
            <p className={styles.empty}>
              Добавь посты или карусели с фото, чтобы увидеть сетку
            </p>
          ) : (
            <div className={styles.grid}>
              {feedPosts.map(({ item, date }) => (
                <button
                  key={item.id}
                  className={styles.cell}
                  onClick={() => setSelected({ item, date })}
                >
                  {item.images?.length > 0 ? (
                    isVideo(item.images[0]) ? (
                      <video src={item.images[0]} muted playsInline preload="metadata" />
                    ) : (
                      <img src={item.images[0]} alt="" />
                    )
                  ) : (
                    <div className={styles.textCell}>
                      <span className={styles.cellIcon}>{CONTENT_TYPE_ICON[item.type]}</span>
                      <span className={styles.cellText}>
                        {item.text.slice(0, 60) || "Без текста"}
                      </span>
                    </div>
                  )}
                  {item.type === "carousel" && item.images?.length > 1 && (
                    <span className={styles.multiIcon}>◫</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <DetailModal
          item={selected.item}
          date={selected.date}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
