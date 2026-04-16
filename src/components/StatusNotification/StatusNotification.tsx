import styles from "./StatusNotification.module.scss";

interface StatusNotificationProps {
  message: string;
}

export function StatusNotification({ message }: StatusNotificationProps) {
  return (
    <div className={styles.notification}>
      {message}
    </div>
  );
}
