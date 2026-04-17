import { useState } from "react";
import { isFirebaseConfigured } from "../../firebase/config";
import { generateRoomId } from "../../firebase/roomService";
import styles from "./RoomBar.module.scss";

interface RoomBarProps {
  roomId: string | null;
  onCreateRoom: (id: string) => void;
  onJoinRoom: (id: string) => void;
  onLeaveRoom: () => void;
}

export function RoomBar({ roomId, onCreateRoom, onJoinRoom, onLeaveRoom }: RoomBarProps) {
  const [joinId, setJoinId] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  if (!isFirebaseConfigured) return null;

  if (roomId) {
    return (
      <div className={styles.bar}>
        <span className={styles.roomBadge}>
          <span className={styles.dot} />
          Комната: {roomId}
        </span>
        <button
          className={styles.btn}
          onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
            navigator.clipboard.writeText(url);
          }}
        >
          Скопировать ссылку
        </button>
        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onLeaveRoom}>
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <button className={styles.btn} onClick={() => onCreateRoom(generateRoomId())}>
        Создать комнату
      </button>
      {showJoin ? (
        <div className={styles.joinRow}>
          <input
            className={styles.joinInput}
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="ID комнаты..."
          />
          <button
            className={styles.btn}
            onClick={() => { if (joinId.trim()) onJoinRoom(joinId.trim()); }}
            disabled={!joinId.trim()}
          >
            Войти
          </button>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShowJoin(false)}>
            Отмена
          </button>
        </div>
      ) : (
        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShowJoin(true)}>
          Войти в комнату
        </button>
      )}
    </div>
  );
}
