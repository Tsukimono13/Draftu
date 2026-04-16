import { useEffect } from "react";
import styles from "./Toast.module.scss";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
