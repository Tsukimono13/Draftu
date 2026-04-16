import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectHashtagSets } from "../../store/selectors";
import { calendarActions } from "../../store/slices/calendarSlice";
import styles from "./HashtagManager.module.scss";

export function HashtagManager() {
  const dispatch = useAppDispatch();
  const sets = useAppSelector(selectHashtagSets);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTags, setNewTags] = useState("");

  const handleAdd = () => {
    if (!newName.trim() || !newTags.trim()) return;
    dispatch(calendarActions.addHashtagSet({ name: newName.trim(), tags: newTags.trim() }));
    setNewName("");
    setNewTags("");
  };

  return (
    <aside className={styles.panel}>
      <button className={styles.toggle} onClick={() => setOpen(!open)}>
        <span className={styles.toggleIcon}>{open ? "▾" : "▸"}</span>
        <span># Коллекции хештегов</span>
        {sets.length > 0 && (
          <span className={styles.badge}>{sets.length}</span>
        )}
      </button>

      <div className={open ? styles.bodyWrap : styles.bodyWrapClosed}>
        <div className={styles.bodyInner}>
          <div className={styles.body}>
            {sets.map((set) => (
              <div key={set.id} className={styles.setCard}>
                <input
                  className={styles.setName}
                  value={set.name}
                  onChange={(e) => dispatch(calendarActions.updateHashtagSet({ id: set.id, name: e.target.value, tags: set.tags }))}
                  placeholder="Название..."
                />
                <textarea
                  className={styles.setTags}
                  value={set.tags}
                  onChange={(e) => dispatch(calendarActions.updateHashtagSet({ id: set.id, name: set.name, tags: e.target.value }))}
                  placeholder="#хештег1 #хештег2 ..."
                  rows={2}
                />
                <button
                  className={styles.setDelete}
                  onClick={() => dispatch(calendarActions.deleteHashtagSet(set.id))}
                  aria-label="Удалить"
                >
                  ✕
                </button>
              </div>
            ))}

            <div className={styles.addForm}>
              <input
                className={styles.addName}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Название набора..."
              />
              <textarea
                className={styles.addTags}
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="#хештег1 #хештег2 #хештег3 ..."
                rows={2}
              />
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={!newName.trim() || !newTags.trim()}
              >
                + Добавить набор
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
