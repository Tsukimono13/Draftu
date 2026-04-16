import { memo, useRef, useState } from "react";
import type { ContentItem, ContentStatus } from "../../store/types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { calendarActions } from "../../store/slices/calendarSlice";
import { dragActions } from "../../store/slices/dragSlice";
import { uiActions } from "../../store/slices/uiSlice";
import { selectHighlightNames, selectHashtagSets } from "../../store/selectors";
import {
  CONTENT_TYPE_LABEL,
  CONTENT_TYPE_ICON,
  STATUS_LABEL,
  TAG_OPTIONS,
} from "../../utils/constants";
import { processMediaFile, isVideo } from "../../utils/imageHelpers";
import styles from "./ContentItemCard.module.scss";

interface ContentItemCardProps {
  item: ContentItem;
  date: string;
}

const statuses: ContentStatus[] = ["planned", "ready", "published"];

export const ContentItemCard = memo(function ContentItemCard({
  item,
  date,
}: ContentItemCardProps) {
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const media = item.images ?? [];
  const isStory = item.type === "story";
  const [collapsed, setCollapsed] = useState(false);
  const [removing, setRemoving] = useState(false);

  const tagInfo = TAG_OPTIONS.find((t) => t.value === item.tag);
  const hasContent = item.text.length > 0 || media.length > 0;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const dataUrl = await processMediaFile(file);
        dispatch(calendarActions.addItemImage({ date, itemId: item.id, image: dataUrl }));
      } catch (e) {
        dispatch(uiActions.showToast(e instanceof Error ? e.message : "Не удалось загрузить файл"));
      }
    }
  };

  return (
    <article
      className={`${styles.card} ${styles[item.status]} ${removing ? styles.cardRemoving : ""}`}
      draggable={!removing}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        dispatch(dragActions.startDrag({ date, itemId: item.id }));
      }}
      onAnimationEnd={() => {
        if (removing) {
          dispatch(calendarActions.deleteItem({ date, itemId: item.id }));
        }
      }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.dragHandle} title="Перетащить">⠿</span>
          {hasContent && (
            <button
              className={styles.collapseBtn}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Развернуть" : "Свернуть"}
            >
              {collapsed ? "▸" : "▾"}
            </button>
          )}
          <span className={`${styles.typeBadge} ${styles[`type_${item.type}`]}`}>
            {CONTENT_TYPE_ICON[item.type]} {CONTENT_TYPE_LABEL[item.type]}
          </span>
          {tagInfo && (
            <span className={styles.tagBadge} style={{ background: tagInfo.color }}>
              {tagInfo.label}
            </span>
          )}
          {collapsed && item.text && (
            <span className={styles.collapsedPreview}>
              {item.text.slice(0, 50)}{item.text.length > 50 ? "…" : ""}
            </span>
          )}
        </div>
        <div className={styles.controls}>
          <input
            type="time"
            className={styles.timeInput}
            value={item.time ?? ""}
            onChange={(e) => dispatch(calendarActions.updateItemTime({ date, itemId: item.id, time: e.target.value || null }))}
            title="Время публикации"
          />
          <select
            className={`${styles.statusSelect} ${styles[`status_${item.status}`]}`}
            value={item.status}
            onChange={(e) => dispatch(calendarActions.updateItemStatus({ date, itemId: item.id, status: e.target.value as ContentStatus }))}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            className={styles.deleteBtn}
            onClick={() => setRemoving(true)}
            aria-label="Удалить"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={`${styles.cardBody} ${collapsed ? styles.cardBodyCollapsed : ""}`}>
        <div className={styles.cardBodyInner}>
          <textarea
            className={styles.textArea}
            value={item.text}
            onChange={(e) => dispatch(calendarActions.updateItemText({ date, itemId: item.id, text: e.target.value }))}
            placeholder={getPlaceholder(item.type)}
            rows={3}
          />
          {(item.type === "post" || item.type === "carousel") && (
            <div className={`${styles.charCount} ${item.text.length > 2200 ? styles.charOver : ""}`}>
              {item.text.length} / 2200
            </div>
          )}

          <MediaGrid media={media} date={date} itemId={item.id} />

          <div className={styles.cardFooter}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button className={styles.attachBtn} onClick={() => fileRef.current?.click()}>
              📎 Фото / видео
            </button>

            <div className={styles.tagSelect}>
              <select
                value={item.tag ?? ""}
                onChange={(e) => dispatch(calendarActions.updateItemTag({ date, itemId: item.id, tag: e.target.value || undefined }))}
                className={styles.tagDropdown}
              >
                <option value="">Метка...</option>
                {TAG_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <HashtagPopup date={date} itemId={item.id} currentText={item.text} />

            <DuplicateButton date={date} itemId={item.id} />

            {isStory && (
              <label className={styles.pinLabel}>
                <input
                  type="checkbox"
                  checked={!!item.pinned}
                  onChange={() => dispatch(calendarActions.toggleItemPinned({ date, itemId: item.id }))}
                  className={styles.pinCheckbox}
                />
                Закрепить
              </label>
            )}
          </div>

          {isStory && item.pinned && (
            <HighlightRow date={date} itemId={item.id} value={item.highlight ?? ""} />
          )}
        </div>
      </div>
    </article>
  );
});

// --- Sub-components ---

function MediaGrid({ media, date, itemId }: { media: string[]; date: string; itemId: string }) {
  const dispatch = useAppDispatch();
  if (media.length === 0) return null;

  return (
    <div className={styles.mediaGrid}>
      {media.map((src, i) => (
        <div key={i} className={styles.mediaThumb}>
          {isVideo(src) ? (
            <video src={src} muted playsInline preload="metadata" controls />
          ) : (
            <img src={src} alt={`Фото ${i + 1}`} />
          )}
          <button
            className={styles.mediaRemove}
            onClick={() => dispatch(calendarActions.removeItemImage({ date, itemId, index: i }))}
            aria-label="Удалить"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function HashtagPopup({ date, itemId, currentText }: { date: string; itemId: string; currentText: string }) {
  const dispatch = useAppDispatch();
  const hashtagSets = useAppSelector(selectHashtagSets);
  const [open, setOpen] = useState(false);

  if (hashtagSets.length === 0) return null;

  const insert = (tags: string) => {
    const separator = currentText.length > 0 ? "\n\n" : "";
    dispatch(calendarActions.updateItemText({ date, itemId, text: currentText + separator + tags }));
    setOpen(false);
  };

  return (
    <div className={styles.hashtagWrap}>
      <button className={styles.attachBtn} onClick={() => setOpen(!open)}>
        # Хештеги
      </button>
      {open && (
        <div className={styles.hashtagPopup}>
          {hashtagSets.map((set) => (
            <button
              key={set.id}
              className={styles.hashtagOption}
              onClick={() => insert(set.tags)}
            >
              {set.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DuplicateButton({ date, itemId }: { date: string; itemId: string }) {
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [targetDate, setTargetDate] = useState("");

  const confirm = () => {
    if (targetDate) {
      dispatch(calendarActions.duplicateItem({ fromDate: date, itemId, toDate: targetDate }));
      setShow(false);
      setTargetDate("");
    }
  };

  return (
    <>
      <button
        className={styles.attachBtn}
        onClick={() => { setShow(!show); setTargetDate(""); }}
        title="Копировать на другой день"
      >
        ⧉ Копия
      </button>
      {show && (
        <div className={styles.duplicateRow}>
          <span className={styles.duplicateLabel}>Копировать на:</span>
          <input
            type="date"
            className={styles.duplicateInput}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <button className={styles.duplicateConfirm} onClick={confirm} disabled={!targetDate}>
            ✓
          </button>
          <button className={styles.duplicateCancel} onClick={() => setShow(false)}>
            ✕
          </button>
        </div>
      )}
    </>
  );
}

function HighlightRow({ date, itemId, value }: { date: string; itemId: string; value: string }) {
  const dispatch = useAppDispatch();
  const highlights = useAppSelector(selectHighlightNames);

  return (
    <div className={styles.highlightRow}>
      <span className={styles.highlightLabel}>Хайлайт:</span>
      <input
        type="text"
        className={styles.highlightInput}
        value={value}
        onChange={(e) => dispatch(calendarActions.updateItemHighlight({ date, itemId, highlight: e.target.value }))}
        placeholder="Название альбома..."
        list="highlight-options"
      />
      {highlights.length > 0 && (
        <datalist id="highlight-options">
          {highlights.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}
    </div>
  );
}

function getPlaceholder(type: string): string {
  switch (type) {
    case "post":
      return "Текст поста, хештеги, описание...";
    case "story":
      return "Идея для сторис, о чём рассказать...";
    case "reels":
      return "Сценарий рилса, идея, музыка...";
    case "carousel":
      return "Слайды карусели, темы, тексты...";
    default:
      return "Описание...";
  }
}
