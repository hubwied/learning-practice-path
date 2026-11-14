import { useEffect, useState, type FormEvent } from "react";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL, emptyDraft, isPriority, isStatus, taskToDraft } from "../domain.ts";
import type { Category, FieldErrors, Task, TaskDraft } from "../types.ts";

type TaskFormProps = {
  categories: Category[];
  editingTask: Task | null;
  onAdd: (draft: TaskDraft) => FieldErrors;
  onUpdate: (id: string, draft: TaskDraft) => FieldErrors;
  onCancel: () => void;
};

export function TaskForm({ categories, editingTask, onAdd, onUpdate, onCancel }: TaskFormProps) {
  const [draft, setDraft] = useState<TaskDraft>(() => emptyDraft(categories[0]?.id ?? ""));
  const [errors, setErrors] = useState<FieldErrors>({});

  const editingId = editingTask?.id ?? null;

  useEffect(() => {
    if (editingTask && editingId) {
      setDraft(taskToDraft(editingTask));
      setErrors({});
      document.getElementById("task-form")?.scrollIntoView({ block: "nearest" });
      return;
    }
    setDraft(emptyDraft(categories[0]?.id ?? ""));
    setErrors({});
    // The draft is reloaded only when the edited task changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  useEffect(() => {
    if (editingId) return;
    setDraft((current) => {
      if (current.categoryId && categories.some((category) => category.id === current.categoryId)) {
        return current;
      }
      return { ...current, categoryId: categories[0]?.id ?? "" };
    });
  }, [categories, editingId]);

  function update<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = editingTask ? onUpdate(editingTask.id, draft) : onAdd(draft);
    setErrors(result);
    if (Object.keys(result).length === 0 && !editingTask) {
      setDraft(emptyDraft(categories[0]?.id ?? ""));
    }
  }

  function handleCancel() {
    onCancel();
    setDraft(emptyDraft(categories[0]?.id ?? ""));
    setErrors({});
  }

  const noCategories = categories.length === 0;

  return (
    <section className="panel" aria-labelledby="task-form-heading">
      <h2 id="task-form-heading">{editingTask ? "Edycja zadania" : "Nowe zadanie"}</h2>
      {noCategories ? <p className="hint">Najpierw dodaj kategorię.</p> : null}
      <form id="task-form" className="task-form" onSubmit={handleSubmit}>
        <label htmlFor="task-title">Nazwa</label>
        <input
          id="task-title"
          value={draft.title}
          onChange={(event) => update("title", event.target.value)}
          autoComplete="off"
        />
        {errors.title ? <p className="field-error">{errors.title}</p> : null}

        <label htmlFor="task-description">Opis</label>
        <textarea
          id="task-description"
          value={draft.description}
          onChange={(event) => update("description", event.target.value)}
          rows={3}
        />
        {errors.description ? <p className="field-error">{errors.description}</p> : null}

        <div className="form-grid">
          <div>
            <label htmlFor="task-priority">Priorytet</label>
            <select
              id="task-priority"
              value={draft.priority}
              onChange={(event) => {
                if (isPriority(event.target.value)) update("priority", event.target.value);
              }}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABEL[priority]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-category">Kategoria</label>
            <select
              id="task-category"
              value={draft.categoryId}
              onChange={(event) => update("categoryId", event.target.value)}
              disabled={noCategories}
            >
              {noCategories ? <option value="">Brak kategorii</option> : null}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? <p className="field-error">{errors.categoryId}</p> : null}
          </div>
          <div>
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={draft.status}
              onChange={(event) => {
                if (isStatus(event.target.value)) update("status", event.target.value);
              }}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-due">Termin</label>
            <input
              id="task-due"
              type="date"
              value={draft.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
            />
            {errors.dueDate ? <p className="field-error">{errors.dueDate}</p> : null}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={noCategories}>
            {editingTask ? "Zapisz" : "Dodaj zadanie"}
          </button>
          {editingTask ? (
            <button type="button" className="secondary" onClick={handleCancel}>
              Anuluj
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
