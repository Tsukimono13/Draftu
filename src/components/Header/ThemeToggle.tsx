import { useState } from "react";
import styles from "./Header.module.scss";

export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.getAttribute("data-theme") === "dark",
  );

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("draftu-theme", next ? "dark" : "light");
  };

  return (
    <button
      className={`${styles.headerBtn} ${styles.headerBtnOutline}`}
      onClick={toggle}
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
