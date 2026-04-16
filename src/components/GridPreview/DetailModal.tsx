import type { ContentItem } from "../../store/types";
import { isVideo } from "../../utils/imageHelpers";
import { CONTENT_TYPE_ICON, MONTH_NAMES_GENITIVE } from "../../utils/constants";
import { parseDate } from "../../utils/dateHelpers";
import styles from "./GridPreview.module.scss";

interface DetailModalProps {
  item: ContentItem;
  date: string;
  onClose: () => void;
}

export function DetailModal({ item, date, onClose }: DetailModalProps) {
  const d = parseDate(date);
  const formattedDate = `${d.getDate()} ${MONTH_NAMES_GENITIVE[d.getMonth()]}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.detail} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailHeader}>
          <span>
            {CONTENT_TYPE_ICON[item.type]} {formattedDate}
            {item.time && ` в ${item.time}`}
          </span>
          <button className={styles.detailClose} onClick={onClose}>
            ✕
          </button>
        </div>
        {item.images?.length > 0 && (
          <div className={styles.detailMedia}>
            {item.images.map((src, i) =>
              isVideo(src) ? (
                <video key={i} src={src} controls playsInline className={styles.detailImg} />
              ) : (
                <img key={i} src={src} alt="" className={styles.detailImg} />
              ),
            )}
          </div>
        )}
        {item.text && (
          <p className={styles.detailText}>{item.text}</p>
        )}
      </div>
    </div>
  );
}
