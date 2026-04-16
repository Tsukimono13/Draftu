import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectNotes } from "../../store/selectors";
import { calendarActions } from "../../store/slices/calendarSlice";
import type { GeneralNote } from "../../store/types";
import styles from "./NotesPanel.module.scss";

export function NotesPanel() {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectNotes);
  const [open, setOpen] = useState(false);

  return (
    <aside className={styles.panel}>
      <button
        className={styles.toggle}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.toggleIcon}>{open ? "▾" : "▸"}</span>
        <span>Общие заметки</span>
        {notes.length > 0 && (
          <span className={styles.badge}>{notes.length}</span>
        )}
      </button>

      <div className={open ? styles.bodyWrap : styles.bodyWrapClosed}>
        <div className={styles.bodyInner}>
          <div className={styles.body}>
            {notes.length === 0 && (
              <p className={styles.empty}>
                Идеи, хештеги, ссылки — всё, что не привязано к дате
              </p>
            )}

            {notes.map((note: GeneralNote) => (
              <div key={note.id} className={styles.noteCard}>
                <textarea
                  className={styles.noteText}
                  value={note.text}
                  onChange={(e) => dispatch(calendarActions.updateNote({ noteId: note.id, text: e.target.value }))}
                  placeholder="Заметка..."
                  rows={2}
                />
                <button
                  className={styles.noteDelete}
                  onClick={() => dispatch(calendarActions.deleteNote(note.id))}
                  aria-label="Удалить заметку"
                >
                  ✕
                </button>
              </div>
            ))}

            <button className={styles.addBtn} onClick={() => dispatch(calendarActions.addNote())}>
              + Новая заметка
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
