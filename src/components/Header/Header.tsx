import { useCallback, useState } from "react";
import type { WeekSummaryDay } from "../../store/selectors";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { WeekPopup } from "./WeekPopup";
import { ThemeToggle } from "./ThemeToggle";
import logoSvg from "../../assets/LogoDraftu.svg";
import styles from "./Header.module.scss";

interface HeaderProps {
  weekCount: number;
  weekSummary: WeekSummaryDay[];
  onReset: () => void;
}

export function Header({ weekCount, weekSummary, onReset }: HeaderProps) {
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = useCallback(() => setShowPopup(false), []);
  const popupRef = useOutsideClick<HTMLDivElement>(closePopup, showPopup);

  return (
    <header className={styles.appHeader}>
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <img src={logoSvg} alt="Draftu" className={styles.appLogo} />
        </div>
        <div className={styles.headerRight}>
          {weekCount > 0 && (
            <div className={styles.counterWrap} ref={popupRef}>
              <button
                className={styles.weekCounter}
                onClick={() => setShowPopup(!showPopup)}
              >
                {weekCount} на неделе
              </button>
              {showPopup && <WeekPopup weekSummary={weekSummary} />}
            </div>
          )}
          <div className={styles.headerActions}>
            <button
              className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
              onClick={onReset}
            >
              Очистить
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
