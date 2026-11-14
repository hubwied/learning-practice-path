import { useState, type FormEvent } from "react";
import type { Category } from "../types.ts";

type CategoryManagerProps = {
  categories: Category[];
  onAdd: (name: string) => string | null;
  onRename: (id: string, name: string) => string | null;
  onDelete: (id: string) => void;
};

export function CategoryManager({ categories, onAdd, onRename, onDelete }: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onAdd(name);
    setError(result);
    if (!result) setName("");
  }

  function beginRename(category: Category) {
    setRenamingId(category.id);
    setRenameValue(category.name);
    setRenameError(null);
  }

  function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!renamingId) return;
    const result = onRename(renamingId, renameValue);
    setRenameError(result);
    if (!result) {
      setRenamingId(null);
      setRenameValue("");
    }
  }

  return (
    <section className="panel" aria-labelledby="categories-heading">
      <h2 id="categories-heading">Kategorie</h2>
      <form className="inline-form" onSubmit={handleAdd}>
        <label htmlFor="category-name">Nowa kategoria</label>
        <div className="inline-controls">
          <input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />
          <button type="submit">Dodaj</button>
        </div>
        {error ? <p className="field-error">{error}</p> : null}
      </form>
      {categories.length === 0 ? <p className="empty">Brak kategorii.</p> : null}
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.id}>
            {renamingId === category.id ? (
              <form className="inline-form" onSubmit={handleRename}>
                <label htmlFor={`rename-${category.id}`}>Nowa nazwa</label>
                <div className="inline-controls">
                  <input
                    id={`rename-${category.id}`}
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    autoComplete="off"
                  />
                  <button type="submit">Zapisz</button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setRenamingId(null);
                      setRenameError(null);
                    }}
                  >
                    Anuluj
                  </button>
                </div>
                {renameError ? <p className="field-error">{renameError}</p> : null}
              </form>
            ) : (
              <div className="category-row">
                <span>{category.name}</span>
                <div className="category-actions">
                  <button type="button" className="secondary" onClick={() => beginRename(category)}>
                    Zmień nazwę
                  </button>
                  <button type="button" className="danger" onClick={() => onDelete(category.id)}>
                    Usuń
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
